import React, { useLayoutEffect, useRef, useState } from 'react';

// Fit the complete formatted number, including commas, into the available width.
export default function ResultOutput({ children }) {
  const container = useRef(null);
  const [fontSize, setFontSize] = useState(undefined);
  useLayoutEffect(() => {
    const element = container.current;
    let active = true;
    const fit = () => {
      if (!active) return;
      const style = getComputedStyle(element);
      const baseSize = parseFloat(style.fontSize);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = `${style.fontWeight} ${baseSize}px ${style.fontFamily}`;
      const width = context.measureText(String(children)).width;
      const available = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
      if (available > 0) setFontSize(Math.min(baseSize, baseSize * available / Math.max(width, 1)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    fit();
    document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => { active = false; observer.disconnect(); window.removeEventListener('resize', fit); };
  }, [children]);
  return <output ref={container} className="fitted-result" aria-live="polite"><span style={{ fontSize, letterSpacing: 0 }}>{children}</span></output>;
}
