import {mountDataTable} from '../engines/components/data-table.mjs';

const controls = document.getElementById('table-controls');
mountDataTable(document.getElementById('crm-contacts'), {
  fields: JSON.parse(document.getElementById('table-fields').textContent),
  controls,
  search: controls.elements.namedItem('query'),
  reset: document.getElementById('table-reset'),
  status: document.getElementById('table-count')
});
