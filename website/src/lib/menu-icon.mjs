// SVG transforms give both controls meaningful fallback artwork if CSS is absent.
export function menuIcon(close = false) {
  const first = close ? 'rotate(-45 12 12)' : 'translate(0 -4)';
  const second = close ? 'rotate(45 12 12)' : 'translate(0 4)';
  return `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" transform="${first}"/><line x1="5" y1="12" x2="19" y2="12" transform="${second}"/></svg>`;
}
