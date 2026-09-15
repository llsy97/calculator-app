import React, { useState } from 'react';
import { units, convertUnit } from './converter.js';
import { formatResult } from './calculator.js';
const defaults = { length: ['m', 'cm'], mass: ['kg', 'g'], temperature: ['°C', '°F'] };
export default function UnitConverter({ korean, onUse }) {
  const [category, setCategory] = useState('length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('cm');
  const [value, setValue] = useState('1');
  let result = null;
  let error = '';
  if (value.trim()) {
    try { result = convertUnit(Number(value), category, from, to); }
    catch { error = korean ? '값과 단위를 확인해 주세요.' : 'Check the value and units.'; }
  }
  const options = Object.keys(units[category]).map(unit => <option key={unit}>{unit}</option>);
  return <section id="unit-converter" className="converter" aria-label={korean ? '단위 변환' : 'Unit converter'}>
    <label>{korean ? '단위 변환' : 'Unit converter'}<select value={category} onChange={e => { setCategory(e.target.value); const [a,b] = defaults[e.target.value]; setFrom(a); setTo(b); }}>{Object.keys(units).map((key,i) => <option key={key} value={key}>{(korean ? ['길이', '무게', '온도'] : ['Length', 'Mass', 'Temperature'])[i]}</option>)}</select></label>
    <label>{korean ? '입력값' : 'Value'}<input type="number" step="any" value={value} onChange={e => setValue(e.target.value)} /></label>
    <div className="conversion-units"><label>{korean ? '변환 전' : 'From'}<select value={from} onChange={e => setFrom(e.target.value)}>{options}</select></label><button onClick={() => { setFrom(to); setTo(from); }} aria-label={korean ? '단위 맞바꾸기' : 'Swap units'}>⇄</button><label>{korean ? '변환 후' : 'To'}<select value={to} onChange={e => setTo(e.target.value)}>{options}</select></label></div>
    <output aria-live="polite">{error || (result === null ? '—' : `${formatResult(result)} ${to}`)}</output>
    <button className="use-conversion" disabled={result === null} onClick={() => onUse(result)}>{korean ? '계산기에 사용' : 'Use in calculator'}</button>
  </section>;
}
