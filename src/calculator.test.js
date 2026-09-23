import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, formatResult, previewExpression } from './calculator.js';
test('live preview follows edits and continuation without stale results', () => {
  assert.deepEqual(['2+3', '5+', '5+4', '5+40', ''].map(value => previewExpression(value)), [5, 5, 9, 45, 0]);
  assert.equal(previewExpression('25(-111)+23'), -2752);
  assert.equal(previewExpression('1/0'), null);
  assert.equal(previewExpression('sqrt('), null);
});
test('pending operators keep the preceding value until a number is entered', () => {
  for (const operator of ['+', '−', '×', '÷', '^', '-', '*', '/']) {
    assert.equal(previewExpression('2+3' + operator), 5);
  }
  assert.deepEqual(['2+3', '2+3×', '2+3×4', '2+3×40'].map(value => previewExpression(value)), [5, 5, 14, 122]);
  assert.equal(previewExpression('(2+3)÷'), 5);
  assert.equal(previewExpression('ANS+', 'DEG', 7), 7);
  assert.equal(previewExpression('1e-'), null);
  assert.equal(previewExpression('1/0+'), null);
  assert.throws(() => evaluate('2+3+'));
});
test('live preview uses angle and last committed answer', () => {
  assert.equal(previewExpression('ANS+1', 'DEG', 5), 6);
  assert.equal(previewExpression('ANS+2', 'DEG', 5), 7);
  assert.equal(previewExpression('sin(π/2)', 'RAD'), 1);
});
import { toggleSign, withinDigitLimit, formatExpression, stripGrouping } from './input.js';
test('grouped numbers and 15-digit limits', () => {
  assert.equal(formatResult(1234567.89), '1,234,567.89');
  assert.equal(formatResult(999999999999999), '999,999,999,999,999');
  assert.equal(formatResult(1e15), '1e+15');
  assert.equal(formatResult(1e-12), '1e-12');
  assert.equal(formatExpression('12345.60+(−9876)'), '12,345.60+(−9,876)');
  assert.equal(stripGrouping('12,345+6,789'), '12345+6789');
  assert.ok(withinDigitLimit('123456789012345+123456789012345'));
  assert.ok(!withinDigitLimit('1234567890123456'));
  assert.ok(!withinDigitLimit('0.123456789012345'));
  assert.ok(withinDigitLimit('1e-12'));
  assert.equal(evaluate('1/3') * 3, 1);
});
test('sign toggles the last number and closes its parentheses', () => {
  assert.equal(toggleSign('458'), '(−458)');
  assert.equal(toggleSign('25+111'), '25+(−111)');
  assert.equal(evaluate(toggleSign('458') + '63'), -28854);
  assert.equal(evaluate('−(458)63'), -28854);
  assert.equal(evaluate(toggleSign(toggleSign('458'))), 458);
});
test('sign handles grouped operands, functions, and signed exponents', () => {
  assert.equal(evaluate(toggleSign('2+(3+4)')), -5);
  assert.equal(evaluate(toggleSign('2+sqrt(9)')), -1);
  assert.equal(evaluate(toggleSign('1e-3')), -.001);
  assert.equal(evaluate(toggleSign('-3')), 3);
  assert.equal(evaluate(toggleSign('2×-3')), 6);
});
const cases = [['2+3×4',14],['(2+3)×4',20],['10%',.1],['200+10%',220],['200−10%',180],['200×10%',20],['200÷10%',2000],['sqrt(9)',3],['2^3',8],['-2^2',-4],['(-2)^2',4],['2^3^2',512],['2^-2',.25],['sin(30)',.5],['asin(0.5)',30],['log(100)',2],['ln(e)',1],['5!',120],['abs(-3)',3],['1/(4)',.25],['200+10%+10%',242]];
for (const [expression, expected] of cases) test(expression, () => assert.ok(Math.abs(evaluate(expression) - expected) < 1e-10));
for (const [expression, expected] of [
  ['25(-111)+23', -2752], ['2(3+4)', 14], ['(2+3)(4-1)', 15],
  ['(2+3)4', 20], ['2π', 2*Math.PI], ['2sin(30)', 1],
  ['2(3)^2', 18], ['-2(3)^2', -18], ['8/2(2+2)', 16],
  ['1e-3(2)', .002], ['3!(2)', 12],
]) test(`implicit multiplication: ${expression}`, () => assert.ok(Math.abs(evaluate(expression) - expected) < 1e-10));
test('implicit multiplication with ANS', () => assert.equal(evaluate('2ANS', 'DEG', 5), 10));
test('malformed numbers remain errors', () => {
  for (const expression of ['1.2.3', '2 3', '25(-111', '2()']) assert.throws(() => evaluate(expression));
});
test('RAD trigonometry', () => { assert.equal(evaluate('sin(π/2)', 'RAD'),1); assert.equal(evaluate('acos(0)', 'RAD'),Math.PI/2); });
test('floating point formatting', () => assert.equal(formatResult(evaluate('0.1+0.2')), '0.3'));
test('ANS retains full precision', () => assert.equal(evaluate('ANS*3','DEG',evaluate('1/3')),1));
for (const expression of ['1/0','sqrt(-1)','ln(0)','asin(2)','tan(90)','171!','(-1)!','1.5!','10^999','2+','(2+3','alert(1)','2;3','(-1)^0.5']) test(`recoverable error: ${expression}`, () => assert.throws(() => evaluate(expression), Error));
