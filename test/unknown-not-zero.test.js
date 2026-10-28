#!/usr/bin/env node
'use strict';
/* Unknown is not zero.
 *
 * scoreAirline() returns nextGenScore 0 AND nextGenPublished false for an
 * unpublished Starlink count (SAS, Air France), and equipped null while fleet
 * is still a number. The Google Flights panel and the popup Streaming row
 * must render n/a / unpublished, never "0%" or "null/123". A measured zero
 * (Delta: published, share 0) stays 0%. A published sub-1% share stays "<1%".
 *
 * Runs the production functions. airlines.js is required, not copied.
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.join(__dirname, '..');
var airlines = require(path.join(ROOT, 'extension', 'airlines.js'));
var content = fs.readFileSync(path.join(ROOT, 'extension', 'content.js'), 'utf8');
var popup = fs.readFileSync(path.join(ROOT, 'extension', 'popup.js'), 'utf8');

function extractFunction(src, name) {
  var start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'missing function ' + name);
  var i = src.indexOf('{', start);
  var depth = 0;
  for (var j = i; j < src.length; j++) {
    var ch = src[j];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(start, j + 1);
    }
  }
  throw new Error('unclosed function ' + name);
}

function loadFns(src, names) {
  var code = names.map(function (name) { return extractFunction(src, name); }).join('\n');
  var ctx = {};
  vm.runInNewContext(code + '\n' + names.map(function (name) {
    return 'this[' + JSON.stringify(name) + '] = ' + name + ';';
  }).join('\n'), ctx);
  return ctx;
}

var gf = loadFns(content, ['gfNextGenRank', 'gfNextGenBadge', 'gfEquippedCount', 'gfStreamMeta']);
var gfNextGenRank = gf.gfNextGenRank;
var gfNextGenBadge = gf.gfNextGenBadge;
var gfEquippedCount = gf.gfEquippedCount;
var gfStreamMeta = gf.gfStreamMeta;
var csFleetText = loadFns(popup, ['csFleetText']).csFleetText;

function scored(key) {
  var row = airlines.scoreAirline(key);
  assert.ok(row, 'scoreAirline(' + key + ')');
  return row;
}

var sas = scored('sas');
var airfrance = scored('airfrance');
var ba = scored('britishairways');
var southwest = scored('southwest');
var delta = scored('delta');

assert.strictEqual(sas.nextGenPublished, false, 'SAS next-gen count is unpublished');
assert.strictEqual(sas.nextGenScore, 0, 'unpublished SAS score is the false zero');
assert.strictEqual(sas.equipped, null, 'SAS equipped stays null');
assert.strictEqual(sas.fleet, 123, 'SAS fleet is still published');
assert.strictEqual(airfrance.nextGenPublished, false);
assert.strictEqual(airfrance.equipped, null);
assert.strictEqual(airfrance.fleet, 229);

assert.strictEqual(gfNextGenBadge(sas).txt, 'n/a', 'SAS panel next-gen is n/a');
assert.strictEqual(gfNextGenBadge(sas).ng, null, 'SAS badge is the null/usl-na branch');
assert.strictEqual(gfNextGenBadge(airfrance).txt, 'n/a');
assert.strictEqual(gfNextGenBadge(airfrance).ng, null);

assert.strictEqual(delta.nextGenPublished, true, 'Delta zero is measured');
assert.strictEqual(delta.nextGenScore, 0);
assert.strictEqual(gfNextGenBadge(delta).txt, '0%', 'measured zero stays 0%');
assert.notStrictEqual(gfNextGenBadge(delta).ng, null);

assert.strictEqual(southwest.nextGenPublished, true);
assert.ok(southwest.nextGenShare > 0, 'Southwest share is a real fraction');
assert.notStrictEqual(gfNextGenBadge(southwest).txt, 'n/a');
assert.notStrictEqual(gfNextGenBadge(southwest).txt, '0%');
assert.ok(/%$/.test(gfNextGenBadge(southwest).txt), 'Southwest prints a percent');

var tiny = { nextGenPublished: true, nextGenScore: 0, nextGenShare: southwest.nextGenShare };
assert.strictEqual(gfNextGenBadge(tiny).txt, '<1%', 'published sub-1% share stays <1%');

assert.ok(gfNextGenRank(sas) < gfNextGenRank(delta), 'unpublished sorts below a measured zero');
assert.ok(gfNextGenRank(airfrance) < gfNextGenRank(delta));
assert.ok(gfNextGenRank(ba) > gfNextGenRank(delta), 'a published positive stays above zero');
assert.strictEqual(gfNextGenRank(delta), 0);
assert.strictEqual(gfNextGenRank(sas), -1);

var order = [sas, airfrance, delta, ba].slice().sort(function (a, b) {
  return (gfNextGenRank(b) - gfNextGenRank(a)) || a.name.localeCompare(b.name);
});
assert.deepStrictEqual(order.map(function (a) { return a.key; }),
  ['britishairways', 'delta', 'airfrance', 'sas']);

assert.strictEqual(gfEquippedCount(sas), '');
assert.strictEqual(gfEquippedCount(airfrance), '');
assert.strictEqual(gfStreamMeta(sas), 'Starlink unpublished');
assert.strictEqual(gfStreamMeta(airfrance), 'Starlink unpublished');
assert.ok(!/null/.test(gfStreamMeta(sas)), 'streaming row must not stringify null');
assert.strictEqual(gfEquippedCount(ba), '5/261');
assert.strictEqual(gfStreamMeta(southwest), 'Starlink 1/803');
assert.strictEqual(gfEquippedCount({ equipped: 0, fleet: 10 }), '0/10', 'published 0 still prints');
assert.strictEqual(gfStreamMeta(delta), delta.systemLabel, 'no fleet number omits the count');

assert.strictEqual(csFleetText(sas), 'Starlink unpublished');
assert.strictEqual(csFleetText(airfrance), 'Starlink unpublished');
assert.ok(!/null/.test(csFleetText(sas)));
assert.ok(!/\d+\s*\/\s*\d+/.test(csFleetText(sas)), 'popup must not invent an equipped count');
assert.strictEqual(csFleetText(ba), 'Starlink 5/261');
assert.strictEqual(csFleetText(southwest), 'Starlink 1/803');
assert.strictEqual(csFleetText({ systemLabel: 'Starlink', equipped: 0, fleet: 10 }), 'Starlink 0/10');
assert.strictEqual(csFleetText(delta), delta.systemLabel + ' fleetwide');

var panel = extractFunction(content, 'renderGFPanel');
assert.ok(/gfNextGenBadge\(a\)/.test(panel), 'panel must use the published-flag badge');
assert.ok(/gfNextGenRank\(/.test(panel), 'panel sort must use the published-flag rank');
assert.ok(/gfStreamMeta\(a\)/.test(panel), 'streaming rows must use the equipped fence');
assert.ok(!/typeof a\.nextGenScore === "number" \? Math\.round\(a\.nextGenScore\)/.test(panel),
  'panel must not treat every numeric nextGenScore as measured');
assert.ok(!/a\.fleet \? " " \+ a\.equipped \+ "\/" \+ a\.fleet/.test(content),
  'streaming rows must not print equipped whenever fleet is set');
assert.ok(!/a\.fleet \? a\.equipped \+ " of " \+ a\.fleet/.test(content),
  'chip tooltip must not print equipped whenever fleet is set');
var equippedFn = extractFunction(content, 'gfEquippedCount');
assert.ok(/equipped == null/.test(equippedFn), 'equipped count must reject null before printing');
assert.ok(equippedFn.indexOf('equipped == null') < equippedFn.indexOf('a.equipped + "/" + a.fleet'));
assert.ok(/nextGenPublished === false/.test(extractFunction(content, 'gfNextGenBadge')));
assert.ok(/equipped != null/.test(extractFunction(popup, 'csFleetText')));
assert.ok(!/a\.fleet \? a\.equipped \+ "\/" \+ a\.fleet/.test(popup),
  'popup must not print equipped whenever fleet is set');

// The old panel formula. SAS would render 0% under it. This control fails
// closed if a future edit returns to typeof-only.
function oldBadge(a) {
  var ng = typeof a.nextGenScore === 'number' ? Math.round(a.nextGenScore) : null;
  var share = typeof a.nextGenShare === 'number' ? a.nextGenShare : null;
  return ng === null ? 'n/a' : (share > 0 && ng === 0 ? '<1%' : ng + '%');
}
assert.strictEqual(oldBadge(sas), '0%', 'control: the retired formula still lies');
assert.notStrictEqual(gfNextGenBadge(sas).txt, oldBadge(sas));

process.stdout.write('ok\n');
