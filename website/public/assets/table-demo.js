import {loadAppearanceEngines} from './appearance-engines.js';
import {setupAppearance} from './appearance.js';
import {mountDataTable} from '../engines/components/data-table.mjs';

const controls = document.getElementById('table-controls');
mountDataTable(document.getElementById('crm-contacts'), {
  fields: JSON.parse(document.getElementById('table-fields').textContent),
  controls,
  search: controls.elements.namedItem('query'),
  reset: document.getElementById('table-reset'),
  status: document.getElementById('table-count')
});

setupAppearance(JSON.parse(document.getElementById('table-appearance-profiles').textContent));

// Use the same opt-in loader as the documentation and dashboard.
const revision = new URL(import.meta.url).search;
await loadAppearanceEngines({
  loadMaterial: () => import('../engines/material.mjs' + revision),
  loadForms: () => import('../engines/forms.mjs' + revision),
  loadMedia: () => import('../engines/media-deformation.mjs' + revision),
  filter: element => controls.contains(element)
});
