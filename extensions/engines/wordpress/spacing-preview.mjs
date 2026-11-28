// Form controls edit only this documentation preview.
export function mountSpacingPreview(root) {
  const form = root.querySelector('form');
  const sides = ['Top', 'Right', 'Bottom', 'Left'];
  const rows = ['margin', 'padding', 'gap'].map(name => {
    const exact = form.elements.namedItem(name);
    const range = form.elements.namedItem(name + '-slider');
    const edge = form.elements.namedItem(name + '-side');
    const summary = exact.closest('fieldset').querySelector('output');
    const values = Array(edge ? 4 : 1).fill(Number(exact.defaultValue));

    function update(syncExact = true) {
      const index = edge && edge.value !== 'all' ? Number(edge.value) : 0;
      const mixed = edge?.value === 'all' && values.some(value => value !== values[0]);
      range.value = values[index];
      if (mixed) range.setAttribute('aria-valuetext', 'Mixed side values');
      else range.removeAttribute('aria-valuetext');
      if (syncExact) {
        exact.value = mixed ? '' : values[index];
        exact.placeholder = mixed ? 'Mixed' : '';
      }
      if (summary) {
        summary.value = values.every(value => value === values[0])
          ? values[0] + ' px on all sides'
          : values.map((value, i) => sides[i] + ' ' + value + ' px').join(', ');
      }
      root.style.setProperty('--_preview-' + name, values.map(value => value + 'px').join(' '));
    }

    function apply(value, syncExact = true) {
      const pixels = Math.min(Number(exact.max), Math.max(Number(exact.min), Math.round(value)));
      if (!edge || edge.value === 'all') values.fill(pixels);
      else values[Number(edge.value)] = pixels;
      update(syncExact);
    }

    if (edge) {
      exact.closest('fieldset').addEventListener('change', event => {
        if (event.target.name === name + '-side') update();
      });
    }
    range.addEventListener('input', () => apply(range.valueAsNumber));
    exact.addEventListener('input', () => {
      if (Number.isFinite(exact.valueAsNumber) && exact.validity.valid) apply(exact.valueAsNumber, false);
    });
    exact.addEventListener('change', () => {
      if (Number.isFinite(exact.valueAsNumber)) apply(exact.valueAsNumber);
      else update();
    });
    update();
    return () => {
      values.fill(Number(exact.defaultValue));
      update();
    };
  });
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => queueMicrotask(() => rows.forEach(reset => reset())));
}
