import {asset, esc, href, jsonScript} from '../lib/config.mjs';

const fields = [
  {key: 'name', label: 'Contact'},
  {key: 'company', label: 'Company'},
  {key: 'owner', label: 'Owner', options: ['Avery Brooks', 'Jordan Lee', 'Sam Patel']},
  {key: 'stage', label: 'Stage', options: ['New', 'Qualified', 'Proposal', 'Won']},
  {key: 'value', label: 'Deal value', format: value =>
    `<data value="${value}">${currency.format(value)}</data>`},
  {key: 'followUp', label: 'Next follow-up', date: true},
  {key: 'renewal', label: 'Renewal date', date: true}
];

const currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0});
const date = new Intl.DateTimeFormat('en', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});

const contacts = [
  {name: 'Nina Santos', company: 'Cedar Works', owner: 'Sam Patel', stage: 'New', value: 2400, followUp: '2026-12-02'},
  {name: 'Leo Martin', company: 'Northline', owner: 'Jordan Lee', stage: 'Proposal', value: 18250, followUp: '2026-12-04', renewal: '2027-03-20'},
  {name: 'Amara Okafor', company: 'Field Studio', owner: 'Avery Brooks', stage: 'Qualified', value: 7800, followUp: '2026-11-30'},
  {name: 'Maya Chen', company: 'Harbor Labs', owner: 'Avery Brooks', stage: 'Won', value: 32000, followUp: '2026-12-17', renewal: '2027-12-01'},
  {name: 'Hugo Costa', company: 'Cedar Works', owner: 'Sam Patel', stage: 'Qualified', value: 12000, followUp: '2026-12-09'},
  {name: 'Elena García', company: 'Orchard Supply', owner: 'Jordan Lee', stage: 'Proposal', value: 9500, followUp: '2026-12-01', renewal: '2027-05-12'},
  {name: 'Iris Wilson', company: 'Juniper Design', owner: 'Sam Patel', stage: 'Won', value: 15800, followUp: '2026-12-14', renewal: '2027-09-15'},
  {name: 'Noah Kim', company: 'Westlake', owner: 'Jordan Lee', stage: 'New', value: 3100, followUp: '2026-12-08'}
];

function cellValue(field, value) {
  if (value == null) return '';
  if (field.date) return `<time datetime="${esc(value)}">${date.format(new Date(value))}</time>`;
  return field.format ? field.format(value) : esc(value);
}

function filterControl({key, label, options, date}) {
  if (options) {
    return `<label>${esc(label)} <select name="${esc(key)}"><option value="">All</option>
      ${options.map(value => `<option>${esc(value)}</option>`).join('')}
    </select></label>`;
  }
  return date ? `<label>${esc(label)} from <input name="${esc(key)}" type="date"></label>` : '';
}

export const tableDemo = {
  slug: 'demos/advanced-table',
  title: 'Advanced table',
  description: 'Search a CRM contact list, choose columns, and filter or sort by record fields.',
  kind: 'application', standalone: true, sections: [], documentation: 'docs/tables',
  entry: 'table-demo', stylesheets: [],
  features: ['Column selection', 'Search and field filters', 'Keyboard-accessible sorting']
};

export function renderTableDemo(base) {
  return `<header id="table-demo-header" class="cluster">
  <a href="${href(base, 'demos')}"><img src="${asset(base, 'assets/brand.svg')}" alt="" width="32" height="32"> UIBMS CSS</a>
  <a href="${href(base, 'demos')}">All demos</a>
</header>
<main id="table-demo" class="stack">
  <header>
    <h1>Advanced table</h1>
    <p>Browse sample CRM contacts. Choose which columns to display and filter the list by owner, stage, or date.</p>
  </header>
  <form id="table-controls" class="stack" hidden>
    <div class="cluster">
      <label>Search contacts <input type="search" name="query" aria-controls="crm-contacts"></label>
      ${fields.map(filterControl).join('')}
    </div>
    <details>
      <summary>Visible columns</summary>
      <fieldset class="cluster">
        <legend>Choose columns</legend>
        ${fields.slice(1).map(({key, label}) =>
          `<label><input type="checkbox" name="columns" value="${esc(key)}" checked> ${esc(label)}</label>`
        ).join('')}
      </fieldset>
    </details>
    <div><button type="button" id="table-reset">Reset table</button></div>
  </form>
  <p id="table-count" role="status"></p>
  <div role="region" aria-label="Scrollable contacts table" tabindex="0">
    <table id="crm-contacts">
      <caption>CRM contacts</caption>
      <thead><tr>${fields.map(({label}) => `<th scope="col">${esc(label)}</th>`).join('')}</tr></thead>
      <tbody>${contacts.map(contact => `<tr>${fields.map((field, index) => {
        const content = cellValue(field, contact[field.key]);
        return index === 0 ? `<th scope="row">${content}</th>` : `<td>${content}</td>`;
      }).join('')}</tr>`).join('')}</tbody>
    </table>
  </div>
  <a href="${href(base, 'docs/tables')}">Table implementation reference</a>
</main>
<script type="application/json" id="table-fields">${jsonScript(fields.map(({key}) => key))}</script>`;
}
