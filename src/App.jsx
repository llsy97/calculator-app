import React, { useEffect, useState } from 'react';
import { evaluate, formatResult } from './calculator.js';
import Icon from './Icon.jsx';
import UnitConverter from './UnitConverter.jsx';
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function useSaved(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback));
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be unavailable in private sessions. */ } }, [key, value]);
  return [value, setValue];
}
function Key({ children, onClick, kind = '', label }) {
  return <button className={`key ${kind}`} onClick={onClick} aria-label={label || String(children)}>{children}</button>;
}
const scientificPages = [
  [['(', '('], [')', ')'], ['x²', '^2'], ['xʸ', '^'],
   ['√', 'sqrt('], ['1/x', 'reciprocal'], ['sin', 'sin('], ['cos', 'cos('],
   ['tan', 'tan('], ['π', 'π'], ['log₁₀', 'log('], ['ln', 'ln('], ['e', 'e']],
  [['(', '('], [')', ')'], ['|x|', 'abs('], ['n!', '!'],
   ['10ˣ', '10^('], ['eˣ', 'e^('], ['asin', 'asin('], ['acos', 'acos('],
   ['atan', 'atan('], ['π', 'π'], ['xʸ', '^'], ['√', 'sqrt('], ['e', 'e']],
];
export default function App() {
  const [language, setLanguage] = useState(() => navigator.languages?.[0] || navigator.language || 'en');
  useEffect(() => {
    const updateLanguage = () => setLanguage(navigator.languages?.[0] || navigator.language || 'en');
    window.addEventListener('languagechange', updateLanguage);
    return () => window.removeEventListener('languagechange', updateLanguage);
  }, []);
  const korean = language.toLowerCase().startsWith('ko');
  const labels = {
    clearHistory: korean ? '기록 지우기' : 'clear history',
    copied: korean ? '복사 완료' : 'copied',
    copyFailed: korean ? '복사할 수 없어요' : 'Copy unavailable',
  };
  const [theme, setTheme] = useSaved('calculator.theme', 'dark');
  const [mode, setMode] = useSaved('calculator.mode', 'Standard');
  const [secondary, setSecondary] = useState(false);
  const [angle, setAngle] = useSaved('calculator.angle', 'DEG');
  const [history, setHistory] = useSaved('calculator.history', []);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(0);
  const [ans, setAns] = useState(() => history[0]?.result ?? 0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const [converterValue, setConverterValue] = useState('1');
  const [copyStatus, setCopyStatus] = useState('');
  function input(token) {
    if (converterOpen) {
      setConverterValue(previous => {
        if (token === 'sign') return previous.startsWith('-') ? previous.slice(1) : '-' + previous;
        if (token === '.') return previous.includes('.') ? previous : (previous || '0') + '.';
        if (/^[0-9]$/.test(token)) return previous === '0' ? token : previous + token;
        return previous;
      });
      return;
    }
    setError('');
    let base = completed ? (/^[+−×÷^%!]/.test(token) ? String(result) : '') : expression;
    if (token === 'reciprocal') base = `1/(${base || String(result)})`;
    else if (token === 'sign') {
      base = completed ? String(result) : expression;
      base = base.startsWith('−(') && base.endsWith(')') ? base.slice(2, -1) : `−(${base || '0'})`;
    } else {
      if (token === '.') {
        const lastNumber = base.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i)?.[0];
        if (lastNumber?.includes('.') || /e/i.test(lastNumber || '')) return;
        if (!lastNumber) token = '0.';
      }
      base += token;
    }
    setExpression(base); setCompleted(false);
  }
  function clear() { if (converterOpen) { setConverterValue(''); return; } setExpression(''); setResult(0); setCompleted(false); setError(''); }
  function backspace() { if (converterOpen) { setConverterValue(value => value.slice(0, -1)); return; } setExpression(expression.slice(0, -1)); setCompleted(false); setError(''); }
  function calculate() {
    if (converterOpen || !expression) return;
    try {
      const value = evaluate(expression, angle, ans);
      setResult(value); setAns(value); setCompleted(true); setError('');
      setHistory(entries => [{ id: Date.now() + Math.random(), expression, result: value, angle }, ...entries].slice(0, 100));
    } catch (e) { setError(e.message); setCompleted(false); }
  }
  function reuse(value) { setResult(value); setExpression(String(value)); setCompleted(true); setError(''); setDrawer(false); }
  async function copy() {
    try { await navigator.clipboard.writeText(formatResult(result)); setCopyStatus(labels.copied); }
    catch { setCopyStatus(labels.copyFailed); }
    setTimeout(() => setCopyStatus(''), 2000);
  }
  useEffect(() => {
    function onKey(event) {
      if (converterOpen && event.key === 'Escape') { setConverterOpen(false); return; }
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, select, textarea, [contenteditable="true"]')) return;
      if (event.target.closest('button') && (event.key === 'Enter' || event.key === ' ')) return;
      const key = event.key;
      if (/^[0-9.()+\-*/^%!]$/.test(key)) { event.preventDefault(); input(({ '*': '×', '/': '÷', '-': '−' })[key] || key); }
      else if (key === 'Enter' || key === '=') { event.preventDefault(); calculate(); }
      else if (key === 'Backspace') { event.preventDefault(); backspace(); }
      else if (key === 'Escape') { if (drawer) setDrawer(false); else clear(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return <main className={`page ${theme}`}>
    <div className="app-wrap">
      <div className="caption">계산기 <span>/ calculator</span></div>
      <section className={`calculator ${mode === 'Scientific' ? 'scientific' : ''} ${converterOpen || mode === 'Scientific' ? 'expanded' : ''}`} aria-label="Calculator">
        <header>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-pressed={theme === 'dark'}><span className="theme-track"><Icon name={theme === 'dark' ? 'sunLight' : 'sun'} /><Icon name={theme === 'dark' ? 'moonDark' : 'moon'} /></span></button>
        </header>
        <div className="mode-row">{mode === 'Scientific' && <div className="angles" aria-label="Angle unit">{['DEG', 'RAD'].map(unit => <button key={unit} aria-pressed={angle === unit} onClick={() => setAngle(unit)}>{unit}</button>)}</div>}</div>
        <div className={`display-region ${drawer ? 'history-open' : ''}`}><div className="display"><input aria-label="Expression" spellCheck="false" placeholder="0" value={expression} onChange={e => { setExpression(e.target.value); setCompleted(false); setError(''); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); } if (e.key === 'Escape') clear(); }}/><output aria-live="polite">{formatResult(result)}</output><div className="error" role="status">{error}</div></div>
                <button className="drawer-tab" aria-label={drawer ? 'Close history' : 'Open history'} onClick={() => setDrawer(!drawer)}>{drawer ? '‹' : '›'}</button>
        {drawer && <aside id="history" className="history" aria-label="Calculation history"><div className="history-list">{history.length ? history.map(entry => <button className="history-entry" key={entry.id} onClick={() => reuse(entry.result)}><span>{entry.expression}</span><strong>{formatResult(entry.result)}</strong><small>{entry.angle}</small></button>) : <p>Your calculations<br/>will appear here.</p>}</div><button className="clear-history" disabled={!history.length} onClick={() => setHistory([])}>{labels.clearHistory}</button></aside>}</div>
        <nav className="toolbar" aria-label="Calculator utilities"><button aria-label={korean ? "단위 변환" : "Unit converter"} aria-expanded={converterOpen} aria-controls="unit-converter" onClick={() => { setConverterOpen(!converterOpen); setMode('Standard'); setDrawer(false); }}><Icon name="ruler" /></button><button className="scientific-toggle" aria-label="Scientific mode" title={mode === 'Scientific' ? 'Switch to Standard' : 'Switch to Scientific'} aria-pressed={mode === 'Scientific'} onClick={() => { setMode(mode === 'Scientific' ? 'Standard' : 'Scientific'); setConverterOpen(false); }}><Icon name="scientific" /></button><button className="copy-button" data-copied={copyStatus === labels.copied} aria-label="Copy result" onClick={copy}><Icon name="copy" /></button><span role="status">{copyStatus}</span><button aria-label="Backspace" onClick={backspace}><Icon name="backspace" /></button></nav>
        <div hidden={!converterOpen}><UnitConverter value={converterValue} onChange={setConverterValue} korean={korean} onUse={value => { reuse(value); setConverterOpen(false); }} /></div>
        <div className="keyboards">
          {mode === 'Scientific' && <div className="science-grid"><button className="key science secondary-toggle" aria-label={korean ? "보조 함수" : "Secondary functions"} aria-pressed={secondary} onClick={() => setSecondary(!secondary)}>2nd</button><button className="key science angle-toggle" aria-label={korean ? '각도 단위 전환' : 'Toggle angle unit'} onClick={() => setAngle(angle === 'DEG' ? 'RAD' : 'DEG')}>{angle}</button><Key kind="science" onClick={() => input('ANS')} label="Insert last answer">ANS</Key>{scientificPages[secondary ? 1 : 0].map(([label, token]) => <Key key={label} kind="science" onClick={() => input(token)}>{label}</Key>)}</div>}
          <div className="standard-grid"><Key kind="utility" onClick={clear} label="All clear">AC</Key><Key kind="utility" onClick={() => input('sign')} label="Toggle sign">+/−</Key><Key kind="utility" onClick={() => input('%')} label="Percent">%</Key><Key kind="operator" onClick={() => input('÷')} label="Divide">÷</Key>
          {['7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+'].map(key => <Key key={key} kind={'×−+'.includes(key) ? 'operator' : ''} onClick={() => input(key)}>{key}</Key>)}
          <Key kind="zero" onClick={() => input('0')}>0</Key><Key onClick={() => input('.') } label="Decimal point">.</Key><Key kind="operator" onClick={calculate} label="Equals">=</Key></div>
        </div>

      </section><p className="hint">A little space to work things out.</p>
    </div>
  </main>;
}
