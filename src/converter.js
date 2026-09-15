export const units = {
  length: { mm: .001, cm: .01, m: 1, km: 1000, in: .0254, ft: .3048, yd: .9144, mi: 1609.344 },
  mass: { mg: .000001, g: .001, kg: 1, oz: .028349523125, lb: .45359237 },
  temperature: { '°C': 1, '°F': 1, K: 1 },
};
export function convertUnit(value, category, from, to) {
  if (!Number.isFinite(value) || !units[category] || !(from in units[category]) || !(to in units[category])) throw new Error('Invalid conversion');
  let result;
  if (category === 'temperature') {
    const celsius = from === '°F' ? (value - 32) * 5 / 9 : from === 'K' ? value - 273.15 : value;
    if (celsius < -273.15 - 1e-10) throw new Error('Below absolute zero');
    result = to === '°F' ? celsius * 9 / 5 + 32 : to === 'K' ? celsius + 273.15 : celsius;
  } else result = value * units[category][from] / units[category][to];
  if (!Number.isFinite(result)) throw new Error('Overflow');
  return result;
}
