# Quiet Calculator

A responsive React calculator with Standard and Scientific modes, light and dark themes, and local calculation history.

## Run locally

```sh
npm install
npm run dev
```

## Verify

```sh
npm test
npm run build
```

`src/App.jsx` contains the interface, `src/styles.css` contains responsive styling, and `src/calculator.js` contains the restricted expression parser. No eval or dynamic code execution is used.

Scientific functions insert an opening parenthesis; enter the argument and close it. Sign toggle negates the current expression. Additive percentages are relative to the left operand; multiplication and division use the percentage's decimal value. History is saved only when Equals or Enter succeeds, with up to 100 entries. History, theme, mode, and angle units persist in localStorage when available. Copy uses the browser clipboard API (localhost or HTTPS).
