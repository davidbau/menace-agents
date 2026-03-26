#!/usr/bin/env node
/**
 * crossref.mjs — Cross-reference LORE entries, git commits, agent sessions,
 * and human messages into a unified day-by-day timeline.
 *
 * Usage:
 *   node crossref.mjs                     # Last 7 days
 *   node crossref.mjs --days 30           # Last 30 days
 *   node crossref.mjs --all               # Everything
 *   node crossref.mjs --date 2026-03-22   # One specific day
 *   node crossref.mjs --output timeline.jsonl  # Machine-readable output
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, basename, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '..', '..', 'agent-logs');
const WAVE_DIR = join(__dirname, '..', '..', 'wave');

// --- CLI ---
const args = process.argv.slice(2);
const getArg = (flag, def) => { const i = args.indexOf(flag); return i >= 0 && i + 1 < args.length ? args[i + 1] : def; };
const hasFlag = (flag) => args.includes(flag);
const days = hasFlag('--all') ? 99999 : parseInt(getArg('--days', '7'));
const dateFilter = getArg('--date', null);
const outputFile = getArg('--output', null);

// Redact secrets from text before including in timeline data.
function redactSecrets(text) {
  if (!text) return text;
  return text
    .replace(/github_pat_[A-Za-z0-9_]{10,}/g, '<github_token>')
    .replace(/ghp_[A-Za-z0-9]{20,}/g, '<github_token>')
    .replace(/ghu_[A-Za-z0-9]{20,}/g, '<github_token>')
    .replace(/sk-ant-[A-Za-z0-9_-]{20,}/g, '<anthropic_key>')
    .replace(/sk-[A-Za-z0-9]{40,}/g, '<api_key>')
    .replace(/AKIA[A-Z0-9]{16}/g, '<aws_key>')
    .replace(/eyJ[A-Za-z0-9_-]{40,}/g, '<jwt_token>');
}

// Watchdog prompts — automated nudges sent when agents go idle.
// These are not human-authored; tag them separately.
const WATCHDOG_PROMPTS = [
  'Please continue making improvements doing the most accurate work possible.',
  'Continue making forward progress with the most careful work possible.',
  'Are you confident in the work that has been accomplished?  If the work is a significant step forward and passes more tests than previous work, then please consider making a commit and push to main, adding documentation about what has been learned so far.',
  'Please keep making progress doing careful, accurate work.',
  'Please keep advancing with precise, thorough improvements.',
  'Keep making meaningful improvements with careful attention to accuracy.',
  'Keep improving and refining with precision and accuracy.',
  'Continue refining and improving with maximum accuracy.',
  'Please continue enhancing with meticulous, accurate work.',
  'Continue advancing the work with precision and thoroughness.',
  'Please continue with the most accurate work possible.',
  'Continue doing precise, thorough work. Consult AGENTS.md for any project-specific guidelines you should follow.',
  'Keep making careful, accurate improvements. If you haven\'t already, review AGENTS.md for guidance on this project.',
  'Please continue making progress. Remember to check AGENTS.md for project guidelines and priorities.',
  'Please consider making a commit and push to main, adding documentation about what has been learned so far, if the work is a significant step forward and passes more tests than previous work.',
  // "Explore" personality prompts
  'Keep going — think broadly and creatively about what to work on next.',
  'Please continue. Be expansive in your thinking and thorough in your execution.',
  'Keep up the momentum. Explore widely, then implement carefully.',
  'Continue making progress. Cast a wide net when planning, then be precise when coding.',
  'Please keep going. Think about the big picture and what would add the most value.',
  'Continue your work. Be ambitious in scope but careful with the details.',
  'Keep making progress. Don\'t be afraid to try creative approaches.',
  'Please continue. Aim for broad coverage and be methodical in your implementation.',
  'Keep going with bold, creative thinking and careful, bug-free execution.',
  'Keep up the great work. If you haven\'t already, review AGENTS.md for guidance on this project.',
  'Continue making progress with creative energy. Consult AGENTS.md for any project-specific guidelines you should follow.',
  // Push prompts
  'Have you made meaningful progress?  If the work is a solid step forward, please consider making a commit and push to main with a summary of what was accomplished and what areas were covered.',
];
const WATCHDOG_SET = new Set(WATCHDOG_PROMPTS);

function isWatchdog(text) {
  return WATCHDOG_SET.has(text.trim());
}

// Convert a timestamp to a "project day" date string.
// Day boundary is 3AM Eastern Time — work past midnight stays on the same day.
// This matches the natural rhythm of the project (late-night sessions).
function projectDay(ts) {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (isNaN(d)) return null;
  // Subtract 3 hours so that 0:00–2:59 AM ET stays on the previous day
  const shifted = new Date(d.getTime() - 3 * 3600000);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Format a date string as "Wednesday February 6, 2026"
function formatDayHeader(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// --- 1. Parse LORE entries by date ---
function parseLore() {
  const loreFile = join(WAVE_DIR, 'docs', 'LORE.md');
  let content;
  try { content = readFileSync(loreFile, 'utf8'); } catch { return []; }

  const entries = [];
  const lines = content.split('\n');
  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      // Save previous
      if (currentEntry) entries.push(currentEntry);
      // Parse date from heading
      const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
      const title = line.replace(/^## /, '').trim();
      currentEntry = {
        date: dateMatch ? dateMatch[1] : null,
        title,
        lineNum: i + 1,
        bodyLines: [],
      };
    } else if (currentEntry) {
      currentEntry.bodyLines.push(line);
    }
  }
  if (currentEntry) entries.push(currentEntry);

  // Compute summary for each entry (first non-empty paragraph)
  for (const e of entries) {
    const body = e.bodyLines.join('\n').trim();
    const firstPara = body.split(/\n\n/)[0]?.trim() || '';
    e.summary = firstPara.substring(0, 200);
    e.bodyLength = body.length;
    delete e.bodyLines;
  }

  return entries;
}

// --- 2. Parse git commits by date ---
function parseGitCommits() {
  const commits = [];
  try {
    // Get commits — use NUL separator for safe parsing of full commit messages.
    // %aI gives ISO date with timezone; we convert to UTC for consistent sorting.
    const log = execSync(
      `git -C "${WAVE_DIR}" log --all --format="%H%x00%aI%x00%an%x00%s%x00%B%x00END" --since="${days}days"`,
      { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 }
    );
    for (const block of log.split('\x00END\n')) {
      if (!block.trim()) continue;
      const parts = block.trim().split('\x00');
      if (parts.length < 5) continue;
      const [hash, isoDate, author, subject, body] = parts;
      // Convert to UTC for consistent cross-source sorting
      const utc = new Date(isoDate);
      if (isNaN(utc)) continue;
      const utcIso = utc.toISOString();
      commits.push({
        hash: hash?.slice(0, 12),
        date: projectDay(utc),
        time: utcIso.slice(11, 16),
        timestamp: utcIso,
        author,
        subject,
        body: redactSecrets((body || '').trim()),
      });
    }
  } catch (e) {
    console.error('Warning: could not read git log:', e.message?.split('\n')[0]);
  }
  return commits;
}

// --- 3. Parse agent sessions (lightweight — just metadata + human messages) ---
function findJsonlFiles(baseDir, subdir) {
  const dir = subdir ? join(baseDir, subdir) : baseDir;
  const files = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.jsonl') && entry.name !== 'history.jsonl') {
        files.push(join(dir, entry.name));
      } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'memory' && entry.name !== 'node_modules') {
        files.push(...findJsonlFiles(dir, entry.name));
      }
    }
  } catch (e) {}
  return files;
}

// Parse a session into a chronological event stream.
// Groups consecutive assistant turns between human messages into "AI work blocks."
// Returns { metadata, events[] } where each event is timestamped and typed.
function parseSessionLight(filePath) {
  const isSubagent = filePath.includes('/subagents/');

  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.trim().split('\n').filter(Boolean);
  const project = relative(LOGS_DIR, filePath).split('/')[0];
  const sid = basename(filePath, '.jsonl');

  let model = null, gitBranch = null, firstTs = null, lastTs = null;
  let userCount = 0, assistCount = 0, totalToolUses = 0;

  // Collect raw turns first
  const turns = []; // { role, ts, text?, tools?, toolCounts?, snippets? }

  for (const line of lines) {
    let d;
    try { d = JSON.parse(line); } catch { continue; }

    const ts = d.timestamp ? (typeof d.timestamp === 'string' ? new Date(d.timestamp).getTime() : d.timestamp) : null;
    if (ts) {
      if (!firstTs || ts < firstTs) firstTs = ts;
      if (!lastTs || ts > lastTs) lastTs = ts;
    }
    if (d.gitBranch) gitBranch = d.gitBranch;

    if (d.type === 'user') {
      userCount++;
      const content = d.message?.content;
      let text = typeof content === 'string' ? content :
                 Array.isArray(content) ? content.filter(c => c.type === 'text').map(c => c.text).join('\n') : '';
      text = text.trim();
      // Filter system-generated
      if (text.startsWith('This session is being continued')) continue;
      if (text.startsWith('<task-notification>')) continue;
      if (text.startsWith('[Request interrupted by user')) continue;
      if (text.startsWith('Your task is to create a detailed summary')) continue;
      if (d.isMeta) continue;
      if (d.userType && d.userType !== 'external') continue;
      const words = text.split(/\s+/).filter(Boolean).length;
      if (words >= 5) {
        const role = isSubagent ? 'agent-directive' : isWatchdog(text) ? 'watchdog' : 'human';
        turns.push({ role, ts, text: redactSecrets(text), words });
      }
    } else if (d.type === 'assistant') {
      assistCount++;
      if (d.message?.model) model = d.message.model;
      const blocks = Array.isArray(d.message?.content) ? d.message.content : [];
      const tools = [];
      let textSnippet = null;
      for (const b of blocks) {
        if (b.type === 'tool_use') {
          totalToolUses++;
          tools.push(b.name);
        }
        if (b.type === 'text' && b.text && !textSnippet) {
          const t = b.text.trim();
          if (t.length > 20 && !t.startsWith('<') && !t.startsWith('{'))
            textSnippet = redactSecrets(t.substring(0, 300));
        }
      }
      turns.push({ role: 'assistant', ts, tools, textSnippet });
    }
  }

  // Now group consecutive assistant turns into "AI work blocks"
  const events = [];
  let aiBlock = null; // accumulator for consecutive assistant turns

  function flushAiBlock() {
    if (!aiBlock) return;
    // Skip empty blocks (no tools, no text — just thinking)
    if (aiBlock.totalTools === 0 && aiBlock.snippets.length === 0) { aiBlock = null; return; }
    const topTools = Object.entries(aiBlock.toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    events.push({
      type: isSubagent ? 'subagent-work' : 'ai-work',
      timestamp: aiBlock.startTs ? new Date(aiBlock.startTs).toISOString() : null,
      turns: aiBlock.turns,
      toolUses: aiBlock.totalTools,
      topTools: topTools.map(([n, c]) => `${n}(${c})`).join(', '),
      // Keep first and last substantive text snippet
      snippets: aiBlock.snippets.slice(0, 1).concat(
        aiBlock.snippets.length > 2 ? aiBlock.snippets.slice(-1) : []
      ).map(s => s.substring(0, 200)),
    });
    aiBlock = null;
  }

  for (const turn of turns) {
    if (turn.role === 'human' || turn.role === 'agent-directive' || turn.role === 'watchdog') {
      flushAiBlock();
      events.push({
        type: turn.role,  // 'human', 'agent-directive', or 'watchdog'
        timestamp: turn.ts ? new Date(turn.ts).toISOString() : null,
        text: turn.text,
        words: turn.words,
      });
    } else {
      if (!aiBlock) aiBlock = { startTs: turn.ts, turns: 0, totalTools: 0, toolCounts: {}, snippets: [] };
      aiBlock.turns++;
      for (const t of turn.tools) {
        aiBlock.totalTools++;
        aiBlock.toolCounts[t] = (aiBlock.toolCounts[t] || 0) + 1;
      }
      if (turn.textSnippet) aiBlock.snippets.push(turn.textSnippet);
    }
  }
  flushAiBlock();

  return {
    project, session: sid, model, gitBranch,
    startDate: firstTs ? projectDay(firstTs) : null,
    startTime: firstTs ? new Date(firstTs).toISOString() : null,
    durationMin: firstTs && lastTs ? Math.round((lastTs - firstTs) / 60000) : 0,
    userCount, assistCount, toolUses: totalToolUses,
    events,
  };
}

// Parse a Codex rollout session (different JSONL format from Claude).
function parseCodexSession(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.trim().split('\n').filter(Boolean);
  const project = relative(LOGS_DIR, filePath).split('/')[0];
  const sid = basename(filePath, '.jsonl');

  let model = 'codex', firstTs = null, lastTs = null;
  let userCount = 0, assistCount = 0, totalToolUses = 0;
  const turns = [];

  for (const line of lines) {
    let d;
    try { d = JSON.parse(line); } catch { continue; }
    const ts = d.timestamp ? new Date(d.timestamp).getTime() : null;
    if (ts) {
      if (!firstTs || ts < firstTs) firstTs = ts;
      if (!lastTs || ts > lastTs) lastTs = ts;
    }

    if (d.type === 'session_meta') {
      if (d.payload?.cwd) model = 'codex';
    } else if (d.type === 'event_msg' && d.payload?.type === 'user_message') {
      userCount++;
      const text = redactSecrets((d.payload.message || d.payload.text || '').trim());
      const words = text.split(/\s+/).filter(Boolean).length;
      if (words >= 3 && text.length > 5) {
        turns.push({ role: isWatchdog(text) ? 'watchdog' : 'human', ts, text, words });
      }
    } else if (d.type === 'event_msg' && d.payload?.type === 'agent_message') {
      assistCount++;
      const text = (d.payload.message || '').trim();
      turns.push({ role: 'assistant', ts, tools: [], textSnippet: text.length > 20 ? text.substring(0, 300) : null });
    } else if (d.type === 'response_item' && d.payload?.type === 'function_call') {
      totalToolUses++;
      const name = d.payload.name || 'exec_command';
      turns.push({ role: 'assistant', ts, tools: [name], textSnippet: null });
    } else if (d.type === 'event_msg' && d.payload?.type === 'agent_reasoning') {
      const text = (d.payload.text || '').trim();
      if (text.length > 20) {
        turns.push({ role: 'assistant', ts, tools: [], textSnippet: text.substring(0, 300) });
      }
    }
  }

  // Group into events (same logic as Claude parser)
  const events = [];
  let aiBlock = null;
  function flushAiBlock() {
    if (!aiBlock) return;
    // Skip empty blocks (no tools, no text — just thinking)
    if (aiBlock.totalTools === 0 && aiBlock.snippets.length === 0) { aiBlock = null; return; }
    const topTools = Object.entries(aiBlock.toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    events.push({
      type: 'ai-work',
      timestamp: aiBlock.startTs ? new Date(aiBlock.startTs).toISOString() : null,
      turns: aiBlock.turns,
      toolUses: aiBlock.totalTools,
      topTools: topTools.map(([n, c]) => `${n}(${c})`).join(', '),
      snippets: aiBlock.snippets.slice(0, 1).concat(
        aiBlock.snippets.length > 2 ? aiBlock.snippets.slice(-1) : []
      ).map(s => s.substring(0, 200)),
    });
    aiBlock = null;
  }
  for (const turn of turns) {
    if (turn.role === 'human') {
      flushAiBlock();
      events.push({ type: 'human', timestamp: turn.ts ? new Date(turn.ts).toISOString() : null, text: turn.text, words: turn.words });
    } else {
      if (!aiBlock) aiBlock = { startTs: turn.ts, turns: 0, totalTools: 0, toolCounts: {}, snippets: [] };
      aiBlock.turns++;
      for (const t of (turn.tools || [])) { aiBlock.totalTools++; aiBlock.toolCounts[t] = (aiBlock.toolCounts[t] || 0) + 1; }
      if (turn.textSnippet) aiBlock.snippets.push(turn.textSnippet);
    }
  }
  flushAiBlock();

  return {
    project, session: sid, model, gitBranch: null,
    startDate: firstTs ? projectDay(firstTs) : null,
    startTime: firstTs ? new Date(firstTs).toISOString() : null,
    durationMin: firstTs && lastTs ? Math.round((lastTs - firstTs) / 60000) : 0,
    userCount, assistCount, toolUses: totalToolUses,
    events,
  };
}

// Detect and parse either Claude or Codex session format
function parseAnySession(filePath) {
  if (filePath.includes('/subagents/')) {
    // Claude subagent — tag events differently
    return parseSessionLight(filePath);
  }
  if (basename(filePath).startsWith('rollout-')) {
    return parseCodexSession(filePath);
  }
  return parseSessionLight(filePath);
}

// --- 4. Build cross-reference ---
console.error('Parsing LORE...');
const loreEntries = parseLore();
console.error(`  ${loreEntries.length} entries (${loreEntries.filter(e => e.date).length} dated)`);

console.error('Parsing git commits...');
const commits = parseGitCommits();
console.error(`  ${commits.length} commits`);

console.error('Scanning agent sessions...');
const cutoffDate = projectDay(Date.now() - days * 86400000);

const allFiles = [];
for (const d of readdirSync(LOGS_DIR).filter(d => {
  try { return statSync(join(LOGS_DIR, d)).isDirectory(); } catch { return false; }
})) {
  allFiles.push(...findJsonlFiles(LOGS_DIR, d));
}

const sessions = [];
const seenSessions = new Set(); // deduplicate same session in multiple dirs
for (const f of allFiles) {
  try {
    const s = parseAnySession(f);
    if (!s) continue;
    if (s.events.length < 1) continue;
    // Deduplicate: same session UUID logged to both quadro-claude and quadro-project-*
    if (seenSessions.has(s.session)) continue;
    seenSessions.add(s.session);
    if (s.startDate && s.startDate < cutoffDate && !dateFilter) continue;
    if (dateFilter && s.startDate !== dateFilter) continue;
    sessions.push(s);
  } catch {}
}
console.error(`  ${sessions.length} sessions with human activity\n`);

// --- Group by date and build interleaved timeline ---
const byDate = {};

function ensureDay(date) {
  if (!byDate[date]) byDate[date] = { lore: [], commits: [], sessions: [], events: [] };
}

for (const e of loreEntries) {
  if (!e.date) continue;
  if (dateFilter && e.date !== dateFilter) continue;
  if (e.date < cutoffDate && !dateFilter) continue;
  ensureDay(e.date);
  byDate[e.date].lore.push(e);
}

const seenCommitHash = {};
for (const c of commits) {
  if (dateFilter && c.date !== dateFilter) continue;
  // Deduplicate commits by hash
  if (seenCommitHash[c.hash]) continue;
  seenCommitHash[c.hash] = true;
  // Skip noise
  if (c.subject?.startsWith('Notes added') || c.subject?.startsWith('Merge branch')) continue;
  ensureDay(c.date);
  byDate[c.date].commits.push(c);
}

for (const s of sessions) {
  if (!s.startDate) continue;
  if (dateFilter && s.startDate !== dateFilter) continue;
  ensureDay(s.startDate);
  byDate[s.startDate].sessions.push(s);
}

// Build interleaved events per day: merge session events, commits, and LORE by timestamp.
for (const [date, day] of Object.entries(byDate)) {
  const allEvents = [];

  // Session events (human messages + AI work blocks)
  for (const s of day.sessions) {
    const proj = s.project?.replace('quadro-project---mazesofmenace-', 'q:')
                           .replace('quadro-project--', 'q:')
                           .replace('quadro-claude', 'q:claude') || '';
    const model = (s.model || '?').replace('claude-', '').replace('-20251001', '').replace('-20250929', '');
    for (const ev of (s.events || [])) {
      allEvents.push({
        ...ev,
        session: s.session,
        project: proj,
        model,
        sessionDur: s.durationMin,
      });
    }
  }

  // Commits as events (timestamp already in UTC from parsing)
  for (const c of day.commits) {
    allEvents.push({
      type: 'commit',
      timestamp: c.timestamp || (c.date + 'T' + (c.time || '00:00') + ':00Z'),
      hash: c.hash,
      subject: c.subject,
      body: c.body || '',
      author: c.author,
    });
  }

  // LORE as events (use date + 23:59 to sort at end, since LORE summarizes the day's work)
  for (const e of day.lore) {
    allEvents.push({
      type: 'lore',
      timestamp: date + 'T23:59:00',
      title: e.title,
      lineNum: e.lineNum,
      summary: e.summary,
    });
  }

  // Sort by timestamp
  allEvents.sort((a, b) => (a.timestamp || '') < (b.timestamp || '') ? -1 : 1);
  day.events = allEvents;
}

// --- 5. Summarize each day ---
function summarizeDay(day) {
  // Collect all text signals: commit subjects, LORE titles, human messages
  const commitSubjects = (day.commits || []).map(c => c.subject || '');
  const loreTitles = (day.lore || []).map(e => e.title || '');
  const humanTexts = (day.events || []).filter(e => e.type === 'human').map(e => e.text || '');

  // Extract commit prefixes (e.g., "parity:", "feat(shell):", "fix:")
  // Skip noise commits (git notes, merges)
  const realCommits = commitSubjects.filter(s =>
    !s.startsWith('Notes added') && !s.startsWith('Merge branch') && !s.startsWith('merge:'));
  const prefixCounts = {};
  for (const s of realCommits) {
    const m = s.match(/^(\w+(?:\([^)]+\))?)\s*:/);
    if (m) prefixCounts[m[1]] = (prefixCounts[m[1]] || 0) + 1;
  }

  // Extract key topics from commit messages (skip git-notes noise)
  const topicWords = {};
  const stopwords = new Set(['the','a','an','in','on','at','to','for','of','and','is','it','with','from','as','by','that','this','not','but','or','be','are','was','were','has','have','had','do','does','did','will','would','can','could','should','may','might','shall','into','all','no','up','out','its','use','add','fix','set','get','new','when','after','before','notes','added','git','merge','branch','main','copy','resolve','conflicts','remote']);
  for (const s of [...realCommits, ...loreTitles]) {
    // Strip prefix like "parity:" or "feat(shell):"
    const body = s.replace(/^\w+(?:\([^)]+\))?\s*:\s*/, '').toLowerCase();
    for (const w of body.split(/[\s,;:.()\[\]{}'"!?\/]+/)) {
      if (w.length > 2 && !stopwords.has(w) && !/^\d+$/.test(w)) {
        topicWords[w] = (topicWords[w] || 0) + 1;
      }
    }
  }

  // Find dominant prefix
  const sortedPrefixes = Object.entries(prefixCounts).sort((a, b) => b[1] - a[1]);
  const topPrefix = sortedPrefixes[0]?.[0] || '';

  // Find top topic words
  const sortedTopics = Object.entries(topicWords).sort((a, b) => b[1] - a[1]);
  const topWords = sortedTopics.slice(0, 8).map(([w]) => w);

  // Game-specific topics — detect from commit prefixes and explicit project references,
  // not from common English words that happen to match game names.
  const games = [];
  // Use commit prefixes like "feat(hack):", "fix(rogue):", "parity(nethack):" and
  // session project names as reliable signals, not body text.
  const projNames = (day.sessions || []).map(s => s.project || '');
  const prefixGames = Object.keys(prefixCounts).join(' ').toLowerCase();
  const commitPrefixText = realCommits.map(s => {
    const m = s.match(/^(\w+)\((\w+)\)/); return m ? m[2] : '';
  }).join(' ').toLowerCase();
  // Also look for paths like hack/js, rogue/js, shell/js in commit messages
  const pathText = realCommits.join(' ').toLowerCase();

  if (pathText.includes('nethack') || pathText.includes('seed0') || pathText.includes('js/cmd.') ||
      pathText.includes('js/allmain') || pathText.includes('comparator') || pathText.includes('c-harness') ||
      projNames.some(p => p.includes('ux') || p.includes('game') || p.includes('mazes')))
    games.push('NetHack');
  if (commitPrefixText.includes('hack') || pathText.includes('hack/js') || pathText.includes('hack/hack-c') ||
      pathText.includes('firsthack') || projNames.some(p => p === 'project-wave'))
    if (!games.includes('NetHack') || pathText.includes('hack/')) games.push('Hack');
  if (commitPrefixText.includes('rogue') || pathText.includes('rogue/js') || pathText.includes('rogue/test'))
    games.push('Rogue');
  if (commitPrefixText.includes('shell') || pathText.includes('shell/') || pathText.includes('shell.js'))
    games.push('Shell');
  if (pathText.includes('dungeon/') || pathText.includes('zork') || projNames.some(p => p.includes('menace') && pathText.includes('dungeon')))
    games.push('Dungeon');
  if (commitPrefixText.includes('logo') || pathText.includes('logo/js') || pathText.includes('logo/'))
    games.push('Logo');
  if (commitPrefixText.includes('basic') || pathText.includes('basic/js') || pathText.includes('basic/'))
    games.push('BASIC');
  // Deduplicate Hack if NetHack is the real subject
  if (games.includes('Hack') && games.includes('NetHack') && !pathText.includes('hack/'))
    games.splice(games.indexOf('Hack'), 1);

  // Build summary from patterns
  const nCommits = (day.commits || []).length;
  const nLore = (day.lore || []).length;

  // Detect major themes
  const themes = [];
  if (topPrefix === 'parity' || topWords.includes('parity') || topWords.includes('diverge') || topWords.includes('rng'))
    themes.push('C parity work');
  if (topPrefix.startsWith('feat') || topWords.includes('implement') || topWords.includes('port'))
    themes.push('new features');
  if (topPrefix === 'fix' || topWords.includes('bug') || topWords.includes('regression'))
    themes.push('bug fixes');
  if (topPrefix === 'refactor' || topWords.includes('refactor') || topWords.includes('cleanup'))
    themes.push('refactoring');
  if (topPrefix === 'docs' || topWords.includes('docs') || topWords.includes('lore'))
    themes.push('documentation');
  if (topWords.includes('test') || topWords.includes('session') || topWords.includes('coverage'))
    themes.push('testing');
  if (topWords.includes('harness') || topWords.includes('recorder') || topWords.includes('dbgmapdump'))
    themes.push('infrastructure');
  if (topWords.includes('display') || topWords.includes('screen') || topWords.includes('render') || topWords.includes('cursor'))
    themes.push('display');
  if (topWords.includes('shell') || topWords.includes('profile') || topWords.includes('login'))
    themes.push('shell');
  if (topWords.includes('monster') || topWords.includes('combat') || topWords.includes('attack'))
    themes.push('combat mechanics');
  if (topWords.includes('level') || topWords.includes('mklev') || topWords.includes('map'))
    themes.push('level generation');
  if (topWords.includes('eat') || topWords.includes('food') || topWords.includes('hunger'))
    themes.push('eating/food');
  if (topWords.includes('save') || topWords.includes('restore'))
    themes.push('save/restore');
  if (topWords.includes('pet') || topWords.includes('dog'))
    themes.push('pet AI');
  if (topWords.includes('pickup') || topWords.includes('invent') || topWords.includes('object'))
    themes.push('inventory/objects');
  if (topWords.includes('travel') || topWords.includes('run') || topWords.includes('move'))
    themes.push('movement');
  if (topWords.includes('gate') || topWords.includes('startup') || topWords.includes('migrate'))
    themes.push('session startup');

  // Build the summary string
  const gameStr = games.length > 0 ? games.join(', ') : '';
  const themeStr = themes.length > 0 ? themes.slice(0, 3).join(', ') : topWords.slice(0, 3).join(', ');

  let summary = '';
  if (gameStr && themeStr) summary = `${gameStr}: ${themeStr}`;
  else if (themeStr) summary = themeStr;
  else if (gameStr) summary = gameStr;
  else if (nCommits > 0) summary = `${nCommits} commits`;
  else summary = 'quiet day';

  if (nLore > 3) summary += ` (${nLore} lessons)`;

  return summary;
}

// --- Output ---
const sortedDates = Object.keys(byDate).sort();

// Add summaries — use hand-written summaries from day-summaries.json if available,
// fall back to auto-generated ones for new days.
let handSummaries = {};
try {
  handSummaries = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'day-summaries.json'), 'utf8'));
} catch {}
for (const date of sortedDates) {
  byDate[date].summary = handSummaries[date] || summarizeDay(byDate[date]);
}

if (outputFile) {
  const out = sortedDates.map(date => JSON.stringify({ date, dayHeader: formatDayHeader(date), summary: byDate[date].summary, ...byDate[date] })).join('\n') + '\n';
  writeFileSync(outputFile, out);
  console.error(`Written to ${outputFile}`);
} else {
  for (const date of sortedDates) {
    const day = byDate[date];
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  ${date}    ${day.sessions.length} sessions  ${day.commits.length} commits  ${day.lore.length} LORE entries`);
    console.log(`${'═'.repeat(70)}`);

    if (day.lore.length > 0) {
      console.log(`\n  LORE (lessons learned):`);
      for (const e of day.lore) {
        console.log(`    L${e.lineNum}: ${e.title.substring(0, 90)}`);
      }
    }

    if (day.commits.length > 0) {
      console.log(`\n  COMMITS:`);
      // Deduplicate by hash
      const seen = new Set();
      for (const c of day.commits) {
        if (seen.has(c.hash)) continue;
        seen.add(c.hash);
        console.log(`    ${c.time} ${c.hash} ${c.author?.substring(0, 15).padEnd(15)} ${c.subject?.substring(0, 65)}`);
      }
    }

    if (day.sessions.length > 0) {
      console.log(`\n  SESSIONS (${day.sessions.length}):`);
      // Show top sessions by duration
      const topSessions = [...day.sessions].sort((a, b) => b.durationMin - a.durationMin).slice(0, 8);
      for (const s of topSessions) {
        const model = (s.model || '?').replace('claude-', '').substring(0, 15);
        console.log(`    ${s.durationMin}m  ${s.project.substring(0, 25).padEnd(25)}  ${model.padEnd(15)}  ${s.userCount}u/${s.assistCount}a/${s.toolUses}t`);
      }
      if (day.sessions.length > 8) console.log(`    ... and ${day.sessions.length - 8} more`);
    }

    if (day.humanMessages.length > 0) {
      // Show a sample of substantive human messages (skip very short ones)
      const substantive = day.humanMessages.filter(m => m.words >= 10).sort((a, b) => b.words - a.words);
      if (substantive.length > 0) {
        console.log(`\n  HUMAN MESSAGES (${substantive.length} substantive, ${day.humanMessages.length} total):`);
        // Show diverse sample: longest, a correction, a question, etc.
        const sample = substantive.slice(0, 8);
        for (const m of sample) {
          const time = m.timestamp?.slice(11, 16) || '??:??';
          const text = m.text.replace(/\n/g, ' ').substring(0, 100);
          console.log(`    ${time}  "${text}"`);
        }
        if (substantive.length > 8) console.log(`    ... and ${substantive.length - 8} more`);
      }
    }
  }
}
