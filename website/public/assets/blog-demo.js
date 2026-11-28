import {setupAppearance} from './appearance.js';
import {loadDrawerFallback} from './appearance-engines.js';

setupAppearance(JSON.parse(document.getElementById('demo-appearance-profiles').textContent));

const header = document.getElementById('journal-header');
const drawer = document.getElementById('journal-drawer');
const trigger = document.getElementById('journal-menu');
const revision = new URL(import.meta.url).search;
await loadDrawerFallback(() => import('../engines/components/drawer.mjs' + revision));
trigger.hidden = false;

const desktop = header.querySelector('nav');
const appearance = document.getElementById('site-appearance');
const closeGroups = nav => nav.querySelectorAll('details[open]').forEach(group => { group.open = false; });

header.addEventListener('click', event => {
  if (event.target.closest('nav a')) closeGroups(desktop);
});
document.addEventListener('pointerdown', event => {
  if (!desktop.contains(event.target)) closeGroups(desktop);
});

for (const nav of [desktop, drawer.querySelector('nav')]) {
  nav.addEventListener('keydown', event => {
    const group = event.target.closest('details[open]');
    if (event.key !== 'Escape' || !group) return;
    event.preventDefault();
    group.open = false;
    group.querySelector('summary').focus();
  });
}

drawer.addEventListener('click', event => {
  if (event.target.closest('nav a') && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) drawer.close();
});
drawer.addEventListener('close', () => closeGroups(drawer));
trigger.addEventListener('click', () => { appearance.open = false; });
window.addEventListener('resize', () => {
  if (drawer.open && !trigger.getClientRects().length) {
    drawer.close();
    desktop.querySelector('a').focus();
  }
}, {passive: true});
