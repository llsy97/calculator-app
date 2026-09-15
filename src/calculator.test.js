import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, formatResult } from './calculator.js';
const cases = [['2+3×4',14],['(2+3)×4',20],['10%',.1],['200+10%',220],['200−10%',180],['200×10%',20],['200÷10%',2000],['sqrt(9)',3],['2^3',8],['-2^2',-4],['(-2)^2',4],['2^3^2',512],['2^-2',.25],['sin(30)',.5],['asin(0.5)',30],['log(100)',2],['ln(e)',1],['5!',120],['abs(-3)',3],['1/(4)',.25],['200+10%+10%',242]];
for (const [expression, expected] of cases) test(expression, () => assert.ok(Math.abs(evaluate(expression) - expected) < 1e-10));
test('RAD trigonometry', () => { assert.equal(evaluate('sin(π/2)', 'RAD'),1); assert.equal(evaluate('acos(0)', 'RAD'),Math.PI/2); });
test('floating point formatting', () => assert.equal(formatResult(evaluate('0.1+0.2')), '0.3'));
test('ANS retains full precision', () => assert.equal(evaluate('ANS*3','DEG',evaluate('1/3')),1));
for (const expression of ['1/0','sqrt(-1)','ln(0)','asin(2)','tan(90)','171!','(-1)!','1.5!','10^999','2+','(2+3','alert(1)','2;3','(-1)^0.5']) test(`recoverable error: ${expression}`, () => assert.throws(() => evaluate(expression), Error));
