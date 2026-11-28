/**
 * Enhance an authored table with one header row and one body of rectangular rows.
 * The field keys follow the authored column order. The first column stays visible.
 */
export function mountDataTable(table, {fields, controls, search, reset, status}) {
  const headers = [...table.tHead.rows[0].cells];
  const body = table.tBodies[0];
  const choices = [...controls.querySelectorAll('input[type="checkbox"][name="columns"]')];
  const filters = fields.map(key => controls.elements.namedItem(key));
  const language = table.closest('[lang]')?.lang || undefined;
  const collator = new Intl.Collator(language, {numeric: true, sensitivity: 'base'});
  const normalize = text => text.toLocaleLowerCase(language).normalize('NFD').replace(/\p{M}/gu, '');
  const records = [...body.rows].map(row => {
    const cells = [...row.cells];
    const labels = cells.map(cell => cell.textContent.trim());
    const values = cells.map((cell, index) => {
      const date = cell.querySelector('time[datetime]');
      if (date || filters[index]?.type === 'date') return date?.dateTime ?? '';
      const data = cell.querySelector('data[value]');
      if (data && data.value.trim() && Number.isFinite(Number(data.value))) return Number(data.value);
      return data?.value ?? labels[index];
    });
    return {row, cells, values, labels: labels.map(normalize), searchText: normalize(labels.join(' '))};
  });
  let sortedIndex = -1;
  let direction = 1;

  function updateRows() {
    const terms = normalize(search.value).trim().split(/\s+/);
    const matchesField = filters.flatMap((filter, index) => {
      const value = filter?.value;
      if (!value) return [];
      if (filter.type === 'date') return [record => record.values[index] >= value];
      if (filter.tagName === 'SELECT') return [record => String(record.values[index]) === value];
      const term = normalize(value.trim());
      return [record => record.labels[index].includes(term)];
    });
    let visible = 0;
    for (const record of records) {
      const matches = terms.every(term => record.searchText.includes(term)) &&
        matchesField.every(matches => matches(record));
      record.row.hidden = !matches;
      if (matches) visible++;
    }
    status.textContent = visible ? `${visible} of ${records.length} rows` : 'No matching rows';
  }

  function updateColumns() {
    const unchecked = new Set(choices.filter(choice => !choice.checked).map(choice => choice.value));
    const hidden = fields.map((key, index) => index !== 0 && unchecked.has(key));
    if (hidden[sortedIndex]) sortBy(-1);
    headers.forEach((header, index) => {
      header.hidden = hidden[index];
      for (const record of records) record.cells[index].hidden = hidden[index];
    });
  }

  const indicators = headers.map((header, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    const indicator = document.createElement('span');
    indicator.setAttribute('aria-hidden', 'true');
    button.append(...header.childNodes, indicator);
    header.append(button);
    button.addEventListener('click', () => sortBy(index));
    return indicator;
  });

  function sortBy(index) {
    direction = index === sortedIndex && direction === 1 ? -1 : 1;
    sortedIndex = index;
    headers.forEach((header, position) => {
      const current = position === index;
      if (current) header.setAttribute('aria-sort', direction === 1 ? 'ascending' : 'descending');
      else header.removeAttribute('aria-sort');
      const indicator = indicators[position];
      if (current) indicator.dataset.icon = direction === 1 ? 'arrow-up' : 'arrow-down';
      else delete indicator.dataset.icon;
    });
    const ordered = index < 0 ? records : [...records].sort((left, right) => {
      const a = left.values[index];
      const b = right.values[index];
      if (a === '' || b === '') return Number(a === '') - Number(b === '');
      const comparison = typeof a === 'number' && typeof b === 'number' ?
        a - b : collator.compare(a, b);
      return comparison * direction;
    });
    for (const {row} of ordered) body.append(row);
  }

  controls.addEventListener('submit', event => event.preventDefault());
  controls.addEventListener('input', event => {
    if (choices.includes(event.target)) updateColumns();
    else updateRows();
  });
  reset.addEventListener('click', () => {
    controls.reset();
    sortBy(-1);
    updateColumns();
    updateRows();
  });
  sortBy(-1);
  updateColumns();
  updateRows();
  controls.hidden = false;
}
