// Form controls edit only this documentation preview.
const cssLength = ({amount, unit}) => amount + unit;

function sliderMaximum(unit, amount) {
  const defaultMaximum = unit === 'px' ? 64 : unit === '%' || /^(?:[sld]?v|cq)/.test(unit) ? 100 : 8;
  return Math.max(defaultMaximum, Math.ceil(amount));
}

export function mountSpacingPreview(root) {
  const form = root.querySelector('form');
  const sides = ['Top', 'Right', 'Bottom', 'Left'];
  const rows = ['margin', 'padding', 'gap'].map(name => {
    const exact = form.elements.namedItem(name);
    const range = form.elements.namedItem(name + '-slider');
    const edge = form.elements.namedItem(name + '-side');
    const unit = form.elements.namedItem(name + '-unit');
    const summary = exact.closest('fieldset').querySelector('output');
    const initial = {amount: Number(exact.defaultValue), unit: unit.value};
    const values = Array(edge ? 4 : 1).fill(initial);
    for (const option of unit.options) {
      if (option.value && globalThis.CSS && !CSS.supports('padding-top', '1' + option.value)) {
        option.disabled = true;
      }
    }

    const allSides = () => !edge || edge.value === 'all';
    const selectedIndex = () => allSides() ? 0 : Number(edge.value);

    function update(syncExact = true) {
      const current = values[selectedIndex()];
      const mixedUnits = allSides() && values.some(value => value.unit !== current.unit);
      const mixed = mixedUnits || allSides() && values.some(value => value.amount !== current.amount);
      unit.value = mixedUnits ? '' : current.unit;
      range.disabled = exact.disabled = mixedUnits;
      range.max = sliderMaximum(current.unit, current.amount);
      range.step = current.unit === 'px' ? '1' : '0.1';
      range.value = current.amount;
      range.setAttribute('aria-valuetext', mixed ? 'Mixed side values' : range.value + ' ' + current.unit);
      if (syncExact) {
        exact.value = mixed ? '' : current.amount;
        exact.placeholder = mixed ? 'Mixed' : '';
      }
      if (summary) {
        const describe = value => value.amount + ' ' + value.unit;
        summary.value = values.every(value => cssLength(value) === cssLength(values[0]))
          ? describe(values[0]) + ' on all sides'
          : values.map((value, i) => sides[i] + ' ' + describe(value)).join(', ');
      }
      root.style.setProperty('--_preview-' + name, values.map(cssLength).join(' '));
    }

    function apply(amount, syncExact = true) {
      const value = {amount, unit: unit.value};
      if (allSides()) values.fill(value);
      else values[selectedIndex()] = value;
      update(syncExact);
    }

    if (edge) {
      exact.closest('fieldset').addEventListener('change', event => {
        if (event.target.name === name + '-side') update();
      });
    }
    unit.addEventListener('change', () => {
      for (const [index, value] of values.entries()) {
        if (allSides() || index === selectedIndex()) values[index] = {...value, unit: unit.value};
      }
      update();
    });
    range.addEventListener('input', () => apply(range.valueAsNumber));
    exact.addEventListener('input', () => {
      if (Number.isFinite(exact.valueAsNumber) && exact.validity.valid) apply(exact.valueAsNumber, false);
    });
    exact.addEventListener('change', () => {
      if (Number.isFinite(exact.valueAsNumber) && exact.validity.valid) apply(exact.valueAsNumber);
      else update();
    });
    update();
    return () => {
      values.fill(initial);
      update();
    };
  });
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => queueMicrotask(() => rows.forEach(reset => reset())));
}
