#!/usr/bin/env node
/**
 * analyze.mjs — Analyze Claude Code agent logs for the Mazes of Menace project.
 *
 * Focus: What works, what doesn't, human-agent interaction patterns.
 *
 * Usage:
 *   node analyze.mjs                          # Full analysis
 *   node analyze.mjs project-wave             # One directory
 *   node analyze.mjs --summary                # High-level stats only
 *   node analyze.mjs --interactions           # Human interaction patterns
 *   node analyze.mjs --tools                  # Tool usage breakdown
 *   node analyze.mjs --models                 # Model usage breakdown
 *   node analyze.mjs --timeline               # Daily activity
 *   node analyze.mjs --stuck                  # Detect stuck/looping sessions
 *   node analyze.mjs --autonomy               # Autonomy ratio analysis
 *   node analyze.mjs --corrections            # Human correction patterns
 *   node analyze.mjs --top-sessions 10        # Longest sessions detail
 *   node analyze.mjs --session <uuid>         # Drill into one session
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '..', '..', 'agent-logs');

// --- CLI ---
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--session' && args[args.indexOf(a) - 1] !== '--top-sessions');
const getArg = (flag) => { const i = args.indexOf(flag); return i >= 0 && i + 1 < args.length ? args[i + 1] : null; };
const topN = parseInt(getArg('--top-sessions')) || 0;
const sessionId = getArg('--session');
const showAll = flags.size === 0 && !topN && !sessionId;

// --- Find JSONL files ---
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

// --- Classify a user message ---
function classifyUserMessage(text) {
  if (!text || typeof text !== 'string') return 'empty';
  const t = text.trim().toLowerCase();
  const len = text.trim().length;

  // Very short responses (approvals, yes/no, continue)
  if (len < 10) {
    if (/^(y(es)?|ok|sure|k|yep|yeah|yup|go|do it|please|thx|thanks|great|good|nice|perfect|exactly|correct)$/i.test(t)) return 'approval';
    if (/^(n(o)?|nope|nah|stop|wait|don't|dont)$/i.test(t)) return 'rejection';
  }

  // Corrections and redirections
  if (/^(no[, ]|don't|dont|stop|wrong|that's not|revert|undo|actually[, ]|wait[, ]|not that)/i.test(t)) return 'correction';
  if (/^(instead|rather|i meant|what i meant|i want)/i.test(t)) return 'redirect';

  // Questions
  if (/\?$/.test(t) || /^(what|why|how|where|when|which|can you|could you|is there|do we|does|did|are|will)/i.test(t)) return 'question';

  // Commands/directives
  if (/^(let's|lets|now|next|go ahead|please|add|fix|change|update|remove|delete|create|make|implement|write|run|test|check|push|commit|pull)/i.test(t)) return 'directive';

  // Explanations (longer messages with context)
  if (len > 200) return 'explanation';
  if (len > 50) return 'guidance';

  return 'other';
}

// --- Parse session ---
function parseSession(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.trim().split('\n').filter(Boolean);

  const messages = []; // { role, timestamp, text, tools[], tokens{} }
  let model = null, gitBranch = null;
  let firstTs = null, lastTs = null;

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
      const content = d.message?.content;
      const text = typeof content === 'string' ? content :
                   Array.isArray(content) ? content.filter(c => c.type === 'text').map(c => c.text).join('\n') : '';
      messages.push({ role: 'user', ts, text, wordCount: text.split(/\s+/).filter(Boolean).length });
    } else if (d.type === 'assistant') {
      const msg = d.message;
      if (!msg) continue;
      if (msg.model) model = msg.model;

      const blocks = Array.isArray(msg.content) ? msg.content : [];
      const textBlocks = blocks.filter(b => b.type === 'text');
      const toolBlocks = blocks.filter(b => b.type === 'tool_use');
      const thinkingBlocks = blocks.filter(b => b.type === 'thinking');
      const text = textBlocks.map(b => b.text || '').join('\n');

      const tools = toolBlocks.map(b => ({
        name: b.name,
        input: b.input,
      }));

      const u = msg.usage || {};
      messages.push({
        role: 'assistant', ts, text, tools,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        hasThinking: thinkingBlocks.length > 0,
        tokens: {
          input: u.input_tokens || 0,
          output: u.output_tokens || 0,
          cacheRead: u.cache_read_input_tokens || 0,
          cacheWrite: u.cache_creation_input_tokens || 0,
        },
      });
    }
  }

  // Compute interaction stats
  const userMsgs = messages.filter(m => m.role === 'user');
  const assistMsgs = messages.filter(m => m.role === 'assistant');
  const userClasses = userMsgs.map(m => classifyUserMessage(m.text));

  // Autonomy: ratio of assistant turns to user turns
  // High ratio = agent working autonomously; low = lots of back-and-forth
  const autonomyRatio = userMsgs.length > 0 ? assistMsgs.length / userMsgs.length : 0;

  // Tool chains: consecutive assistant messages with tools (no user intervention)
  let maxToolChain = 0, currentChain = 0;
  for (const m of messages) {
    if (m.role === 'assistant' && m.tools.length > 0) {
      currentChain++;
      if (currentChain > maxToolChain) maxToolChain = currentChain;
    } else if (m.role === 'user') {
      currentChain = 0;
    }
  }

  // Stuck detection: repeated identical tool calls
  const toolSeq = assistMsgs.filter(m => m.tools.length > 0).map(m =>
    m.tools.map(t => `${t.name}:${JSON.stringify(t.input).substring(0, 100)}`).join('+')
  );
  let maxRepeat = 0, repeatCount = 1;
  for (let i = 1; i < toolSeq.length; i++) {
    if (toolSeq[i] === toolSeq[i-1]) { repeatCount++; if (repeatCount > maxRepeat) maxRepeat = repeatCount; }
    else repeatCount = 1;
  }

  // Token totals
  const totalInput = assistMsgs.reduce((a, m) => a + (m.tokens?.input || 0), 0);
  const totalOutput = assistMsgs.reduce((a, m) => a + (m.tokens?.output || 0), 0);

  // Correction rate
  const corrections = userClasses.filter(c => c === 'correction' || c === 'rejection' || c === 'redirect').length;

  return {
    file: filePath,
    sessionId: basename(filePath, '.jsonl'),
    project: relative(LOGS_DIR, filePath).split('/')[0],
    model, gitBranch,
    messages,
    userCount: userMsgs.length,
    assistCount: assistMsgs.length,
    totalMessages: messages.length,
    userClasses,
    autonomyRatio: Math.round(autonomyRatio * 100) / 100,
    maxToolChain,
    maxRepeat,
    corrections,
    correctionRate: userMsgs.length > 0 ? Math.round(corrections / userMsgs.length * 100) : 0,
    totalInput, totalOutput,
    totalToolUses: assistMsgs.reduce((a, m) => a + m.tools.length, 0),
    toolCounts: (() => {
      const tc = {};
      for (const m of assistMsgs) for (const t of m.tools) tc[t.name] = (tc[t.name] || 0) + 1;
      return tc;
    })(),
    startTime: firstTs ? new Date(firstTs) : null,
    endTime: lastTs ? new Date(lastTs) : null,
    durationMin: firstTs && lastTs ? Math.round((lastTs - firstTs) / 60000 * 10) / 10 : 0,
    userWordCount: userMsgs.reduce((a, m) => a + m.wordCount, 0),
    assistWordCount: assistMsgs.reduce((a, m) => a + m.wordCount, 0),
  };
}

// --- Collect sessions ---
const dirs = positional.length > 0 ? positional : readdirSync(LOGS_DIR).filter(d => {
  try { return statSync(join(LOGS_DIR, d)).isDirectory() && d !== 'node_modules'; } catch { return false; }
});

console.log(`Scanning ${dirs.length} directories...`);
const allFiles = [];
for (const d of dirs) allFiles.push(...findJsonlFiles(LOGS_DIR, d));
console.log(`Found ${allFiles.length} session files\n`);

const sessions = [];
let errors = 0;
for (const f of allFiles) {
  try {
    if (sessionId && !f.includes(sessionId)) continue;
    sessions.push(parseSession(f));
  } catch (e) { errors++; }
}
const active = sessions.filter(s => s.totalMessages > 1);
if (errors) console.log(`(${errors} parse errors)\n`);

// === Single session drill-down ===
if (sessionId) {
  const s = active[0];
  if (!s) { console.log('Session not found'); process.exit(1); }
  console.log(`=== SESSION ${s.sessionId} ===`);
  console.log(`Project: ${s.project}  Model: ${s.model}  Branch: ${s.gitBranch}`);
  console.log(`Duration: ${s.durationMin}m  Messages: ${s.userCount} user / ${s.assistCount} assistant`);
  console.log(`Autonomy: ${s.autonomyRatio}  Max tool chain: ${s.maxToolChain}  Corrections: ${s.corrections}`);
  console.log(`\n--- Conversation flow ---`);
  let turnNum = 0;
  for (const m of s.messages) {
    if (m.role === 'user') {
      const cls = classifyUserMessage(m.text);
      const preview = m.text.trim().replace(/\n/g, ' ').substring(0, 120);
      console.log(`\n[${++turnNum}] USER (${cls}): ${preview}`);
    } else {
      const toolStr = m.tools.length > 0 ? ` [${m.tools.map(t => t.name).join(', ')}]` : '';
      const preview = m.text.trim().replace(/\n/g, ' ').substring(0, 120);
      console.log(`    ASSIST${toolStr}: ${preview || '(tools only)'}`);
    }
  }
  process.exit(0);
}

// === Summary ===
if (showAll || flags.has('--summary')) {
  const totalUser = active.reduce((a, s) => a + s.userCount, 0);
  const totalAssist = active.reduce((a, s) => a + s.assistCount, 0);
  const totalTools = active.reduce((a, s) => a + s.totalToolUses, 0);
  const totalDur = active.reduce((a, s) => a + s.durationMin, 0);
  const avgAutonomy = active.reduce((a, s) => a + s.autonomyRatio, 0) / active.length;

  console.log('=== PROJECT OVERVIEW ===');
  console.log(`Sessions:             ${active.length}`);
  console.log(`Human messages:       ${totalUser.toLocaleString()}`);
  console.log(`Agent responses:      ${totalAssist.toLocaleString()}`);
  console.log(`Tool invocations:     ${totalTools.toLocaleString()}`);
  console.log(`Total session time:   ${Math.round(totalDur / 60)}h ${Math.round(totalDur % 60)}m`);
  console.log(`Avg autonomy ratio:   ${avgAutonomy.toFixed(2)} (agent turns per human turn)`);
  console.log();

  // By project
  const byProject = {};
  for (const s of active) {
    if (!byProject[s.project]) byProject[s.project] = { sessions: 0, user: 0, assist: 0, tools: 0, dur: 0, corrections: 0, userWords: 0 };
    const p = byProject[s.project];
    p.sessions++; p.user += s.userCount; p.assist += s.assistCount;
    p.tools += s.totalToolUses; p.dur += s.durationMin;
    p.corrections += s.corrections; p.userWords += s.userWordCount;
  }
  console.log('=== BY PROJECT ===');
  console.log(`${'Project'.padEnd(45)} Sess  Human  Agent  Tools  Hours  Corr%`);
  for (const [name, p] of Object.entries(byProject).sort((a, b) => b[1].sessions - a[1].sessions)) {
    const corrPct = p.user > 0 ? Math.round(p.corrections / p.user * 100) : 0;
    console.log(`${name.padEnd(45)} ${String(p.sessions).padStart(4)}  ${String(p.user).padStart(5)}  ${String(p.assist).padStart(5)}  ${String(p.tools).padStart(5)}  ${(p.dur / 60).toFixed(0).padStart(5)}  ${String(corrPct).padStart(4)}%`);
  }
  console.log();
}

// === Human interaction patterns ===
if (showAll || flags.has('--interactions')) {
  const allClasses = {};
  const classByProject = {};
  let totalUserWords = 0, totalAssistWords = 0;
  let shortMessages = 0, longMessages = 0;

  for (const s of active) {
    totalUserWords += s.userWordCount;
    totalAssistWords += s.assistWordCount;
    for (const c of s.userClasses) {
      allClasses[c] = (allClasses[c] || 0) + 1;
      if (!classByProject[s.project]) classByProject[s.project] = {};
      classByProject[s.project][c] = (classByProject[s.project][c] || 0) + 1;
    }
    for (const m of s.messages.filter(m => m.role === 'user')) {
      if (m.wordCount <= 5) shortMessages++;
      if (m.wordCount > 50) longMessages++;
    }
  }

  const totalHuman = Object.values(allClasses).reduce((a, b) => a + b, 0);
  console.log('=== HUMAN INTERACTION PATTERNS ===');
  console.log(`Total human messages: ${totalHuman.toLocaleString()}`);
  console.log(`Avg human words/msg:  ${totalHuman > 0 ? Math.round(totalUserWords / totalHuman) : 0}`);
  console.log(`Avg agent words/msg:  ${active.reduce((a, s) => a + s.assistCount, 0) > 0 ? Math.round(totalAssistWords / active.reduce((a, s) => a + s.assistCount, 0)) : 0}`);
  console.log(`Short (≤5 words):     ${shortMessages} (${Math.round(shortMessages / totalHuman * 100)}%)`);
  console.log(`Long (>50 words):     ${longMessages} (${Math.round(longMessages / totalHuman * 100)}%)`);
  console.log();
  console.log('Message types:');
  for (const [cls, count] of Object.entries(allClasses).sort((a, b) => b[1] - a[1])) {
    const pct = Math.round(count / totalHuman * 100);
    const bar = '█'.repeat(Math.round(pct / 2));
    console.log(`  ${cls.padEnd(14)} ${String(count).padStart(7)}  ${String(pct).padStart(3)}%  ${bar}`);
  }
  console.log();
}

// === Autonomy analysis ===
if (showAll || flags.has('--autonomy')) {
  // Bucket sessions by autonomy ratio
  const buckets = { '0-1 (heavy guidance)': [], '1-2 (collaborative)': [], '2-5 (mostly autonomous)': [], '5+ (highly autonomous)': [] };
  for (const s of active) {
    if (s.autonomyRatio < 1) buckets['0-1 (heavy guidance)'].push(s);
    else if (s.autonomyRatio < 2) buckets['1-2 (collaborative)'].push(s);
    else if (s.autonomyRatio < 5) buckets['2-5 (mostly autonomous)'].push(s);
    else buckets['5+ (highly autonomous)'].push(s);
  }
  console.log('=== AUTONOMY ANALYSIS ===');
  console.log('(Autonomy = agent messages per human message)\n');
  for (const [label, bucket] of Object.entries(buckets)) {
    const avgCorr = bucket.length > 0 ? bucket.reduce((a, s) => a + s.correctionRate, 0) / bucket.length : 0;
    const avgChain = bucket.length > 0 ? bucket.reduce((a, s) => a + s.maxToolChain, 0) / bucket.length : 0;
    console.log(`${label.padEnd(30)} ${String(bucket.length).padStart(5)} sessions  avg correction rate: ${avgCorr.toFixed(0)}%  avg max tool chain: ${avgChain.toFixed(1)}`);
  }
  console.log();
}

// === Correction patterns ===
if (showAll || flags.has('--corrections')) {
  console.log('=== CORRECTION PATTERNS ===');
  console.log('Sessions with highest correction rates:\n');
  const withCorrections = active.filter(s => s.corrections > 2 && s.userCount > 5)
    .sort((a, b) => b.correctionRate - a.correctionRate);
  console.log(`${'Session'.padEnd(40)} ${'Project'.padEnd(30)} Msgs  Corr  Rate  Duration`);
  for (const s of withCorrections.slice(0, 15)) {
    console.log(`${s.sessionId.slice(0, 38).padEnd(40)} ${s.project.slice(0, 28).padEnd(30)} ${String(s.userCount).padStart(4)}  ${String(s.corrections).padStart(4)}  ${String(s.correctionRate).padStart(3)}%  ${s.durationMin}m`);
  }
  console.log();

  // What do corrections look like?
  const correctionTexts = [];
  for (const s of active) {
    for (let i = 0; i < s.messages.length; i++) {
      const m = s.messages[i];
      if (m.role === 'user') {
        const cls = classifyUserMessage(m.text);
        if (cls === 'correction' || cls === 'rejection' || cls === 'redirect') {
          correctionTexts.push(m.text.trim().replace(/\n/g, ' ').substring(0, 120));
        }
      }
    }
  }
  if (correctionTexts.length > 0) {
    console.log(`Sample corrections (${correctionTexts.length} total):`);
    // Show a diverse sample
    const step = Math.max(1, Math.floor(correctionTexts.length / 20));
    for (let i = 0; i < correctionTexts.length && i / step < 20; i += step) {
      console.log(`  "${correctionTexts[i]}"`);
    }
  }
  console.log();
}

// === Stuck/loop detection ===
if (showAll || flags.has('--stuck')) {
  console.log('=== STUCK / LOOPING SESSIONS ===');
  const stuck = active.filter(s => s.maxRepeat >= 3).sort((a, b) => b.maxRepeat - a.maxRepeat);
  console.log(`Sessions with ≥3 repeated identical tool calls: ${stuck.length}\n`);
  console.log(`${'Session'.padEnd(40)} ${'Project'.padEnd(30)} Repeats  Duration  Model`);
  for (const s of stuck.slice(0, 15)) {
    console.log(`${s.sessionId.slice(0, 38).padEnd(40)} ${s.project.slice(0, 28).padEnd(30)} ${String(s.maxRepeat).padStart(7)}  ${String(s.durationMin).padStart(8)}m  ${(s.model || '?').slice(0, 20)}`);
  }
  console.log();
}

// === Tool usage ===
if (showAll || flags.has('--tools')) {
  const globalTools = {};
  for (const s of active) for (const [n, c] of Object.entries(s.toolCounts)) globalTools[n] = (globalTools[n] || 0) + c;
  console.log('=== TOOL USAGE ===');
  for (const [name, count] of Object.entries(globalTools).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name.padEnd(35)} ${count.toLocaleString().padStart(8)}`);
  }
  console.log();
}

// === Model usage ===
if (showAll || flags.has('--models')) {
  const byModel = {};
  for (const s of active) {
    const m = s.model || 'unknown';
    if (!byModel[m]) byModel[m] = { sessions: 0, input: 0, output: 0, tools: 0, corrections: 0, userMsgs: 0 };
    byModel[m].sessions++; byModel[m].input += s.totalInput; byModel[m].output += s.totalOutput;
    byModel[m].tools += s.totalToolUses; byModel[m].corrections += s.corrections; byModel[m].userMsgs += s.userCount;
  }
  console.log('=== MODEL USAGE ===');
  for (const [m, d] of Object.entries(byModel).sort((a, b) => b[1].sessions - a[1].sessions)) {
    const corrRate = d.userMsgs > 0 ? Math.round(d.corrections / d.userMsgs * 100) : 0;
    console.log(`  ${m.padEnd(40)} ${String(d.sessions).padStart(5)} sess  ${String(d.tools).padStart(7)} tools  corr: ${corrRate}%`);
  }
  console.log();
}

// === Timeline ===
if (showAll || flags.has('--timeline')) {
  const byDay = {};
  for (const s of active) {
    if (!s.startTime) continue;
    const day = s.startTime.toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { sessions: 0, user: 0, assist: 0, tools: 0, dur: 0, corrections: 0 };
    byDay[day].sessions++; byDay[day].user += s.userCount; byDay[day].assist += s.assistCount;
    byDay[day].tools += s.totalToolUses; byDay[day].dur += s.durationMin; byDay[day].corrections += s.corrections;
  }
  const days = Object.keys(byDay).sort();
  console.log('=== DAILY TIMELINE (last 30 days) ===');
  console.log(`${'Date'.padEnd(12)} Sess  Human  Agent  Tools  Hours  Corr`);
  for (const day of days.slice(-30)) {
    const d = byDay[day];
    console.log(`${day}  ${String(d.sessions).padStart(4)}  ${String(d.user).padStart(5)}  ${String(d.assist).padStart(5)}  ${String(d.tools).padStart(5)}  ${(d.dur/60).toFixed(1).padStart(5)}  ${String(d.corrections).padStart(4)}`);
  }
  console.log();
}

// === Top sessions ===
if (topN > 0) {
  const byDur = [...active].sort((a, b) => b.durationMin - a.durationMin);
  console.log(`=== TOP ${topN} LONGEST SESSIONS ===`);
  console.log(`${'Session'.padEnd(40)} ${'Project'.padEnd(30)} Dur(h)  Human  Agent  Auton  Corr%`);
  for (const s of byDur.slice(0, topN)) {
    console.log(`${s.sessionId.slice(0, 38).padEnd(40)} ${s.project.slice(0, 28).padEnd(30)} ${(s.durationMin/60).toFixed(1).padStart(5)}  ${String(s.userCount).padStart(5)}  ${String(s.assistCount).padStart(5)}  ${String(s.autonomyRatio).padStart(5)}  ${String(s.correctionRate).padStart(4)}%`);
  }
  console.log();
}
