// A small recursive-descent parser. Only the tokens and functions below are allowed.
// Percent carries a flag so additive percentages can be relative to the left side.
const fail = (message) => { throw new Error(message); };
const checked = (value) => Number.isFinite(value) ? value : fail('Result is too large.');
export function formatResult(value) {
  if (Object.is(value, -0)) return '0';
  return Number(value.toPrecision(12)).toString();
}
// Preview never commits an answer or history entry. null means not yet valid.
export function previewExpression(expression, angle = 'DEG', ans = 0) {
  if (!expression.trim()) return 0;
  try { return evaluate(expression, angle, ans); }
  catch {
    // A trailing operator is waiting for its operand: show the value before it.
    // Keep actual evaluation strict, and do not treat an unfinished exponent as e.
    const pending = expression.trimEnd().match(/^(.*\S)\s*[+−×÷*/^\-]\s*$/);
    if (!pending || /\d[eE]$/.test(pending[1])) return null;
    try { return evaluate(pending[1], angle, ans); }
    catch { return null; }
  }
}
export function evaluate(expression, angle = 'DEG', ans = 0) {
  const source = expression.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').replaceAll('π', 'pi');
  const tokens = source.match(/(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|[a-zA-Z]+|[+\-*/^()%!]/g) || [];
  if (tokens.join('') !== source.replace(/\s/g, '')) fail('Unsupported input.');
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const node = (value, percent = false) => ({ value: checked(value), percent });
  const radians = (x) => angle === 'DEG' ? x * Math.PI / 180 : x;
  const inverse = (x) => angle === 'DEG' ? x * 180 / Math.PI : x;
  function call(name, x) {
    switch (name) {
      case 'sqrt': if (x < 0) fail('Square root needs a nonnegative number.'); return Math.sqrt(x);
      case 'ln': case 'log': if (x <= 0) fail('Logarithm needs a positive number.'); return name === 'ln' ? Math.log(x) : Math.log10(x);
      case 'sin': return Math.sin(radians(x));
      case 'cos': return Math.cos(radians(x));
      case 'tan': if (Math.abs(Math.cos(radians(x))) < 1e-14) fail('Tangent is undefined at this angle.'); return Math.tan(radians(x));
      case 'asin': case 'acos': if (Math.abs(x) > 1) fail('Input must be between −1 and 1.'); return inverse(name === 'asin' ? Math.asin(x) : Math.acos(x));
      case 'atan': return inverse(Math.atan(x));
      case 'abs': return Math.abs(x);
      default: return fail('Unknown function.');
    }
  }
  function primary() {
    const token = take();
    if (!token) fail('Complete the expression.');
    if (token === '(') { const result = add(); if (take() !== ')') fail('Close the parenthesis.'); return result; }
    if (/^(?:\d|\.)/.test(token)) return node(Number(token));
    if (token === 'pi') return node(Math.PI);
    if (token === 'e') return node(Math.E);
    if (token === 'ANS') return node(ans);
    if (/^[a-z]+$/.test(token)) {
      if (take() !== '(') fail('Add a parenthesis after the function.');
      const input = add();
      if (take() !== ')') fail('Close the parenthesis.');
      return node(call(token, input.value));
    }
    return fail('Check the expression.');
  }
  function postfix() {
    let result = primary();
    while (peek() === '%' || peek() === '!') {
      if (take() === '%') result = node(result.value / 100, true);
      else {
        if (!Number.isInteger(result.value) || result.value < 0) fail('Factorial needs a nonnegative integer.');
        if (result.value > 170) fail('Factorial supports numbers up to 170.');
        let value = 1;
        for (let i = 2; i <= result.value; i++) value *= i;
        result = node(value);
      }
    }
    return result;
  }
  function power() {
    const left = postfix();
    if (peek() !== '^') return left;
    take(); const right = unary();
    if (left.value === 0 && right.value < 0) fail('Cannot divide by zero.');
    const value = left.value ** right.value;
    if (Number.isNaN(value)) fail('This expression has no real result.');
    return node(value);
  }
  function unary() {
    if (peek() === '+' || peek() === '-') { const sign = take(); const n = unary(); return node(sign === '-' ? -n.value : n.value, n.percent); }
    return power();
  }
  function multiply() {
    let left = unary();
    // Implicit multiplication has the same precedence as explicit * and /.
    // Do not accept adjacent numeric tokens (e.g. 1.2.3) as multiplication.
    const implicitProduct = () => {
      const next = peek();
      const previous = tokens[position - 1];
      return next === '(' || /^(pi|e|ANS|sqrt|sin|cos|tan|asin|acos|atan|log|ln|abs)$/.test(next || '') ||
        (/^[\d.]/.test(next || '') && /^(\)|!|%|pi|e|ANS)$/.test(previous || ''));
    };
    while (peek() === '*' || peek() === '/' || implicitProduct()) {
      const op = peek() === '*' || peek() === '/' ? take() : '*';
      const right = unary();
      if (op === '/' && right.value === 0) fail('Cannot divide by zero.');
      left = node(op === '*' ? left.value * right.value : left.value / right.value);
    }
    return left;
  }
  function add() {
    let left = multiply();
    while (peek() === '+' || peek() === '-') {
      const op = take(), right = multiply();
      const value = right.percent ? left.value * right.value : right.value;
      left = node(op === '+' ? left.value + value : left.value - value);
    }
    return left;
  }
  const result = add();
  if (position !== tokens.length) fail('Check operators and parentheses.');
  return result.value;
}
