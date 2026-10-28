#!/usr/bin/env node
'use strict';
/* Every decision-strip state has role=status and a non-empty accessible name.
 *
 * The strip is shared by United, Navan, and Alaska. This reads extension/content.js
 * the way the other plain-node gates do. It does not rewrite the strip.
 * Watching the current source pass does not prove the guard can fail. */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var STATES = [
  { id: 'loading', prefix: 'Checking this page' },
  { id: 'unavailable', prefix: 'Comparison unavailable' },
  { id: 'no-data', prefix: 'No comparison available' },
  { id: 'single', prefix: 'Not enough to compare' },
  { id: 'close', prefix: 'No clear winner' },
  { id: 'winner', label: '${esc(aria)}' }
];
var CARRIER_CLAUSE = 'unscored flights remain after scored United flights';
var NAVAN_GATE_PREFIX = '${NAVAN ? "; ';

function fail(label, message) {
  throw new Error(label + ': ' + message);
}

function reject(name, fn, expect) {
  var threw = false;
  var message = '';
  try {
    fn();
  } catch (err) {
    threw = true;
    message = err.message || String(err);
  }
  if (!threw) throw new Error('FAIL ' + name + ': planted strip defect escaped');
  assert.ok(expect.test(message),
    name + ' must fail matching ' + expect + ', got: ' + message);
  process.stdout.write('REJECT ' + name + '\n');
}

function extractDecisionStrip(content) {
  var start = content.indexOf('function decisionStrip(');
  var end = start < 0 ? -1 : content.indexOf('/* ── Streaming score section', start);
  if (start < 0) fail('extract', 'function decisionStrip( not found');
  if (end < 0) fail('extract', 'Streaming score section boundary not found');
  return content.slice(start, end);
}

function sectionOpens(body) {
  var re = /<section class="usl-decision usl-decision--([a-z0-9-]+)"/g;
  var found = [];
  var match;
  while ((match = re.exec(body))) found.push(match[1]);
  return found;
}

function sectionChunk(body, id) {
  var marker = '<section class="usl-decision usl-decision--' + id + '"';
  var at = body.indexOf(marker);
  if (at < 0) fail(id, 'missing section template');
  var end = body.indexOf('</section>', at);
  if (end < 0) fail(id, 'section template has no closing tag');
  return body.slice(at, end + '</section>'.length);
}

function openingTag(chunk, id) {
  var end = chunk.indexOf('>');
  if (end < 0) fail(id, 'section opening tag is unclosed');
  return chunk.slice(0, end + 1);
}

function checkWinnerAria(body) {
  var built = body.match(/const aria = `([^`]*)`/);
  if (!built) fail('winner', 'aria string builder missing');
  if (built[1].indexOf('Best WiFi choice ${best.fn}:') !== 0) {
    fail('winner', 'aria builder must start Best WiFi choice');
  }
  if (built[1].indexOf('historical Starlink odds') < 0) {
    fail('winner', 'aria builder must contain historical Starlink odds');
  }
  var gate = NAVAN_GATE_PREFIX + CARRIER_CLAUSE + '" : ""}';
  var gateAt = body.indexOf(gate);
  var clauseAt = body.indexOf(CARRIER_CLAUSE);
  var occurrences = body.split(CARRIER_CLAUSE).length - 1;
  if (occurrences !== 1 || gateAt < 0 || clauseAt !== gateAt + NAVAN_GATE_PREFIX.length) {
    fail('winner', 'carrier clause must be gated on NAVAN only');
  }
  if (/ALASKA\s*\?/.test(body)) {
    fail('winner', 'carrier clause must not be gated on ALASKA');
  }
}

function checkDecisionStrip(body) {
  var opens = sectionOpens(body);
  assert.deepStrictEqual(opens, STATES.map(function (state) { return state.id; }),
    'decision strip must have exactly the six state templates');

  STATES.forEach(function (state) {
    var opening = openingTag(sectionChunk(body, state.id), state.id);
    if (opening.indexOf('role="status"') < 0) {
      fail(state.id, 'role=status');
    }
    var live = 'aria-live="${stripLive("' + state.id + '")}"';
    if (opening.indexOf(live) < 0) {
      fail(state.id, 'aria-live must be routed through stripLive');
    }
    var label = opening.match(/aria-label="([^"]*)"/);
    if (!label || !label[1]) fail(state.id, 'non-empty aria-label');
    if (state.id === 'winner') {
      if (label[1] !== state.label) fail(state.id, 'aria-label must be ${esc(aria)}');
      return;
    }
    if (!state.prefix) fail(state.id, 'literal prefix must be non-empty');
    if (label[1].indexOf(state.prefix) !== 0) {
      fail(state.id, 'aria-label must start with its literal prefix');
    }
  });

  var lives = body.match(/aria-live="([^"]*)"/g) || [];
  if (lives.length !== STATES.length) {
    fail('strip', 'aria-live must be routed through stripLive for every state');
  }
  lives.forEach(function (attr) {
    if (attr.indexOf('stripLive(') < 0) {
      fail('strip', 'aria-live must be routed through stripLive for every state');
    }
  });

  checkWinnerAria(body);
}

function stripAriaLabel(body, id) {
  var chunk = sectionChunk(body, id);
  var at = body.indexOf(chunk);
  var opening = openingTag(chunk, id);
  var labelAt = opening.indexOf('aria-label="');
  if (labelAt < 0) fail('self-test setup', id + ' aria-label not found');
  var valueEnd = opening.indexOf('"', labelAt + 'aria-label="'.length);
  if (valueEnd < 0) fail('self-test setup', id + ' aria-label is unclosed');
  var removeFrom = labelAt;
  if (removeFrom > 0 && opening.charAt(removeFrom - 1) === ' ') removeFrom -= 1;
  var brokenChunk = opening.slice(0, removeFrom) + opening.slice(valueEnd + 1) +
    chunk.slice(opening.length);
  return body.slice(0, at) + brokenChunk + body.slice(at + chunk.length);
}

var content = fs.readFileSync(path.join(ROOT, 'extension', 'content.js'), 'utf8');
var body = extractDecisionStrip(content);
assert.ok(body.indexOf('function streamingRows') < 0,
  'decisionStrip extract must stop before the Streaming score section');
checkDecisionStrip(body);
process.stdout.write('PASS decision strip: six states, role=status, non-empty aria-label\n');

var stripped = stripAriaLabel(body, 'loading');
assert.ok(stripped.indexOf('aria-label="Checking this page') < 0,
  'self-test must actually remove the loading aria-label');
reject('stripped template', function () {
  checkDecisionStrip(stripped);
}, /loading: non-empty aria-label/);

process.stdout.write('ok\n');
