import React from 'react';

// Original artwork extracted from the supplied components.svg.
export default function Icon({ name }) {
  const artwork = { ruler: 4, scientific: 5, copy: 6, sun: 2, moon: 3, sunLight: 0, moonDark: 1 };
  if (name === 'scientific' || name === 'ruler' || name === 'copy') return <span className={`icon icon-${name}`} aria-hidden="true" />;
  if (name in artwork) return <img className={`icon icon-${name}`} src={`/design/image${artwork[name]}_40038_718.png`} alt="" aria-hidden="true" />;
  if (name === 'backspace') return <svg className="icon" viewBox="390 94 24 24" aria-hidden="true" focusable="false"><path d="M411.167 98H397.417C396.784 98 396.289 98.3111 395.959 98.7822L391 106L395.959 113.209C396.289 113.68 396.784 114 397.417 114H411.167C412.175 114 413 113.2 413 112.222V99.7778C413 98.8 412.175 98 411.167 98ZM411.167 112.222H397.481L393.2 106L397.472 99.7778H411.167V112.222ZM400.543 110.444L403.833 107.253L407.124 110.444L408.417 109.191L405.126 106L408.417 102.809L407.124 101.556L403.833 104.747L400.543 101.556L399.25 102.809L402.541 106L399.25 109.191L400.543 110.444Z" fill="currentColor" /></svg>;
  const paths = {
    history: <><path d="M4 9a8 8 0 1 1 0 7M4 4v5h5"/><path d="M12 7v5l3 2"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
