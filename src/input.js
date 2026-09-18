// Toggle the final operand; keep the rest of a chained expression intact.
export function toggleSign(expression) {
  const source = expression.trimEnd();
  if (!source || /[+−×÷*/^(-]$/.test(source)) return source + '(−0)';
  let start;
  if (source.endsWith(')')) {
    let depth = 0;
    for (let i = source.length - 1; i >= 0; i--) {
      if (source[i] === ')') depth++;
      if (source[i] === '(' && --depth === 0) { start = i; break; }
    }
    if (start === undefined) return source;
    const group = source.slice(start);
    if (/^\([−-](?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?\)$/.test(group)) {
      // Retain grouping so a preceding number stays an implicit product.
      return source.slice(0, start) + '(' + group.slice(2);
    }
    const fn = source.slice(0, start).match(/(?:sqrt|asin|acos|atan|sin|cos|tan|log|ln|abs)$/);
    if (fn) start -= fn[0].length;
  } else {
    const operand = source.match(/(?:(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|π|pi|ANS|e)[!%]*$/);
    if (!operand) return source;
    start = operand.index;
  }
  const prefix = source.slice(0, start);
  const operand = source.slice(start);
  if (/[−-]$/.test(prefix) && (prefix.length === 1 || /[+−×÷*/^(-]/.test(prefix.at(-2)))) {
    return prefix.slice(0, -1) + operand;
  }
  return prefix + '(−' + operand + ')';
}
