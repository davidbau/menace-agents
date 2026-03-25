#!/usr/bin/env node
/**
 * extract-human.mjs — Extract human-authored messages from agent sessions.
 *
 * Filters out tool approvals, system messages, and empty turns to surface
 * only the substantive human text: directives, corrections, questions,
 * explanations. This is the raw material for understanding human intent
 * and what kinds of guidance were given to agents.
 *
 * Usage:
 *   node extract-human.mjs                        # All projects, last 7 days
 *   node extract-human.mjs --days 30              # Last 30 days
 *   node extract-human.mjs --all                  # Everything
 *   node extract-human.mjs --project project-wave # One project
 *   node extract-human.mjs --session <uuid>       # One session
 *   node extract-human.mjs --min-words 10         # Skip short messages
 *   node extract-human.mjs --corrections          # Only corrections/redirects
 *   node extract-human.mjs --search "parity"      # Search human messages
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, basename, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '..', '..', 'agent-logs');

// --- CLI ---
const args = process.argv.slice(2);
const getArg = (flag, def) => { const i = args.indexOf(flag); return i >= 0 && i + 1 < args.length ? args[i + 1] : def; };
const hasFlag = (flag) => args.includes(flag);
const days = hasFlag('--all') ? 99999 : parseInt(getArg('--days', '7'));
const projectFilter = getArg('--project', null);
const sessionFilter = getArg('--session', null);
const minWords = parseInt(getArg('--min-words', '3'));
const onlyCorrections = hasFlag('--corrections');
const searchTerm = getArg('--search', null);
const outputFile = getArg('--output', null);
const cutoffMs = Date.now() - days * 86400000;

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

// --- Classify ---
function classify(text) {
  if (!text) return 'empty';
  const t = text.trim().toLowerCase();
  const len = text.trim().length;
  if (len < 3) return 'minimal';
  if (/^(y(es)?|ok|sure|k|yep|yeah|yup|go|do it|please|thx|thanks|great|good|nice|perfect|exactly|correct)$/i.test(t)) return 'approval';
  if (/^(no[, ]|don't|dont|stop|wrong|that's not|revert|undo|actually[, ]|wait[, ]|not that|no no)/i.test(t)) return 'correction';
  if (/^(instead|rather|i meant|what i meant|i want(?!ed))/i.test(t)) return 'redirect';
  if (/\?$/.test(t) || /^(what|why|how|where|when|which|can you|could you|is there|do we|does |did |are |will )/i.test(t)) return 'question';
  if (/^(let's|lets|now |next|go ahead|please |add |fix |change |update |remove |delete |create |make |implement|write |run |test |check |push|commit|pull)/i.test(t)) return 'directive';
  if (len > 200) return 'explanation';
  if (len > 50) return 'guidance';
  return 'statement';
}

// --- Extract human messages from one file ---
function extractHuman(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.trim().split('\n').filter(Boolean);
  const project = relative(LOGS_DIR, filePath).split('/')[0];
  const sid = basename(filePath, '.jsonl');

  const result = [];
  let model = null, gitBranch = null, firstTs = null;
  let turnIndex = 0;

  for (const line of lines) {
    let d;
    try { d = JSON.parse(line); } catch { continue; }

    if (d.gitBranch) gitBranch = d.gitBranch;

    if (d.type === 'assistant' && d.message?.model) model = d.message.model;

    if (d.type !== 'user') continue;

    const ts = d.timestamp ? (typeof d.timestamp === 'string' ? new Date(d.timestamp).getTime() : d.timestamp) : null;
    if (!firstTs && ts) firstTs = ts;

    const content = d.message?.content;
    let text = '';
    if (typeof content === 'string') {
      text = content;
    } else if (Array.isArray(content)) {
      text = content.filter(c => c.type === 'text').map(c => c.text).join('\n');
    }

    // Skip tool approvals and empty messages
    text = text.trim();
    if (!text) continue;

    // Filter out system-generated content, not real human text
    if (text.startsWith('This session is being continued from a previous conversation')) continue;
    if (text.startsWith('<task-notification>')) continue;
    if (text.startsWith('[Request interrupted by user')) continue;
    if (text.startsWith('Your task is to create a detailed summary')) continue;
    if (d.isMeta) continue;
    // Skip agent-spawned subagent prompts (userType !== 'external' means system/agent)
    if (d.userType && d.userType !== 'external') continue;

    // Skip very short approval-like messages
    const words = text.split(/\s+/).filter(Boolean).length;
    if (words < minWords) continue;

    const cls = classify(text);

    // Filter by corrections only
    if (onlyCorrections && cls !== 'correction' && cls !== 'redirect') continue;

    // Filter by search term
    if (searchTerm && !text.toLowerCase().includes(searchTerm.toLowerCase())) continue;

    turnIndex++;
    result.push({
      project,
      session: sid,
      turn: turnIndex,
      timestamp: ts ? new Date(ts).toISOString() : null,
      date: ts ? new Date(ts).toISOString().slice(0, 10) : null,
      class: cls,
      words,
      text,
      model,
      gitBranch,
    });
  }

  return { messages: result, firstTs, project, session: sid };
}

// --- Collect ---
const dirs = readdirSync(LOGS_DIR).filter(d => {
  try { return statSync(join(LOGS_DIR, d)).isDirectory() && d !== 'node_modules'; } catch { return false; }
});

const allFiles = [];
for (const d of dirs) {
  if (projectFilter && d !== projectFilter) continue;
  allFiles.push(...findJsonlFiles(LOGS_DIR, d));
}

console.error(`Scanning ${allFiles.length} session files...`);

const allMessages = [];
let sessionsScanned = 0, sessionsWithHuman = 0;

for (const f of allFiles) {
  if (sessionFilter && !f.includes(sessionFilter)) continue;
  try {
    const { messages, firstTs } = extractHuman(f);
    sessionsScanned++;
    // Date filter
    if (firstTs && firstTs < cutoffMs && !sessionFilter) continue;
    if (messages.length > 0) {
      sessionsWithHuman++;
      allMessages.push(...messages);
    }
  } catch (e) {}
}

// Sort by timestamp
allMessages.sort((a, b) => (a.timestamp || '') < (b.timestamp || '') ? -1 : 1);

console.error(`${sessionsScanned} sessions scanned, ${sessionsWithHuman} with human messages, ${allMessages.length} messages extracted\n`);

// --- Output ---
if (outputFile) {
  // Write as JSONL for further analysis
  const out = allMessages.map(m => JSON.stringify(m)).join('\n') + '\n';
  writeFileSync(outputFile, out);
  console.error(`Written to ${outputFile}`);
} else {
  // Pretty-print to stdout
  let lastDate = null, lastSession = null;
  for (const m of allMessages) {
    if (m.date !== lastDate) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`  ${m.date}`);
      console.log(`${'='.repeat(60)}`);
      lastDate = m.date;
    }
    if (m.session !== lastSession) {
      console.log(`\n--- ${m.project} / ${m.session.slice(0, 36)} (${m.model || '?'}) ---`);
      lastSession = m.session;
    }
    const tag = m.class !== 'statement' && m.class !== 'explanation' && m.class !== 'guidance'
      ? ` [${m.class}]` : '';
    const time = m.timestamp ? m.timestamp.slice(11, 16) : '??:??';
    // Truncate long messages for readability
    const maxLen = 300;
    const display = m.text.length > maxLen ? m.text.substring(0, maxLen) + '...' : m.text;
    console.log(`  ${time}${tag}  ${display.replace(/\n/g, '\n        ')}`);
  }

  // Summary
  const classes = {};
  for (const m of allMessages) classes[m.class] = (classes[m.class] || 0) + 1;
  console.log(`\n--- Summary: ${allMessages.length} messages across ${sessionsWithHuman} sessions ---`);
  for (const [cls, count] of Object.entries(classes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cls.padEnd(14)} ${count}`);
  }
}
