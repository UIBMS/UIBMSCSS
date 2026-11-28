// WordPress recognizes these serialized core blocks in the code editor and in
// theme pattern files. Documentation previews come from the same markup.
function block(name, attributes, html) {
  const options = Object.keys(attributes).length ? ' ' + JSON.stringify(attributes) : '';
  return '<!-- wp:' + name + options + ' -->\n' + html + '\n<!-- /wp:' + name + ' -->';
}

function group(tag, classes, children) {
  const attributes = {className: classes};
  if (tag !== 'div') attributes.tagName = tag;
  return block('group', attributes,
    '<' + tag + ' class="wp-block-group ' + classes + '">' + children.join('\n\n') + '</' + tag + '>');
}

const heading = (text, level = 2) => block('heading', level === 2 ? {} : {level},
  '<h' + level + ' class="wp-block-heading">' + text + '</h' + level + '>');
const paragraph = text => block('paragraph', {}, '<p>' + text + '</p>');
const actions = label => block('buttons', {},
  '<div class="wp-block-buttons">' +
  block('button', {}, '<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com/">' + label + '</a></div>') +
  '</div>');

export const wordpressPatterns = [
  {
    slug: 'hero',
    title: 'Hero',
    description: 'Introduce a page with a heading, a short description, and a primary link.',
    category: 'banner',
    markup: group('section', 'panel stack', [
      heading('A better workspace'),
      paragraph('Give your team one place to plan projects and follow their progress.'),
      actions('Explore the workspace')
    ])
  },
  {
    slug: 'feature-grid',
    title: 'Feature grid',
    description: 'Use a responsive grid of editable Group blocks for a short list of features.',
    category: 'columns',
    markup: group('section', 'stack', [
      heading('What you can do'),
      group('div', 'grid', [
        group('div', 'card stack', [heading('Plan together', 3), paragraph('Keep decisions and milestones in one place.')]),
        group('div', 'card stack', [heading('Track progress', 3), paragraph('See what is in motion and what needs attention.')]),
        group('div', 'card stack', [heading('Share updates', 3), paragraph('Give everyone the same view of the work.')])
      ])
    ])
  },
  {
    slug: 'media-and-text',
    title: 'Media and text',
    description: 'Pair an editable Image block with a heading and copy. Insert your own image in WordPress.',
    category: 'text',
    markup: group('div', 'grid', [
      block('image', {}, '<figure class="wp-block-image"><img alt=""/></figure>'),
      group('div', 'stack', [
        heading('A closer look'),
        paragraph('Show the product in use and explain what readers should notice.')
      ])
    ])
  },
  {
    slug: 'call-to-action',
    title: 'Call to action',
    description: 'Close a section with a clear next step.',
    category: 'call-to-action',
    markup: group('section', 'panel stack', [
      heading('Ready to get started?'),
      paragraph('Find out how to set up a workspace for your team.'),
      actions('Get started')
    ])
  }
];

export function wordpressPreview(markup) {
  return markup
    .replace('<img alt=""/>', '<img src="{{base}}assets/material.svg" alt="">')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ class="([^"]+)"/g, (_, names) => {
      const classes = names.split(' ').filter(name => !/^wp-(?:block-|element-)/.test(name));
      return classes.length ? ' class="' + classes.join(' ') + '"' : '';
    })
    .replace('href="https://example.com/"', 'href="{{base}}docs/quick-start/"')
    .trim();
}

export function wordpressPatternFile(pattern) {
  return [
    '<?php',
    '/**',
    ' * Title: UIBMS ' + pattern.title,
    ' * Slug: uibms/' + pattern.slug,
    ' * Categories: ' + pattern.category,
    ' * Description: ' + pattern.description,
    ' */',
    '?>',
    pattern.markup,
    ''
  ].join('\n');
}

// Use the documented portable subset in theme.json. The browser preview can
// offer newer CSS units independently of the installed Gutenberg version.
export const wordpressThemeSpacingUnits = [
  'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex', 'cm', 'mm', 'in', 'pt', 'pc'
];
const spacingUnitGroups = [
  ['Common', ['px', 'rem', 'em', '%', 'vw', 'vh']],
  ['Font relative', ['ch', 'ex', 'cap', 'ic', 'lh', 'rch', 'rex', 'rcap', 'ric', 'rlh']],
  ['Viewport', ['vi', 'vb', 'vmin', 'vmax',
    ...['sv', 'lv', 'dv'].flatMap(prefix => ['w', 'h', 'i', 'b', 'min', 'max'].map(axis => prefix + axis))]],
  ['Container', ['cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax']],
  ['Physical', ['cm', 'mm', 'q', 'in', 'pt', 'pc']]
];

function spacingRow(name, label, value, edges) {
  return [
    '    <fieldset>',
    '      <legend>' + label + '</legend>',
    ...(edges ? [
      '      <details>',
      '        <summary>Choose sides</summary>',
      '        <fieldset><legend>' + label + ' edges</legend>',
      ...['Top', 'Left', 'All sides', 'Right', 'Bottom'].map((side, index) => {
        const value = [0, 3, 'all', 1, 2][index];
        return '          <label><input type="radio" name="' + name + '-side" value="' + value + '"' +
          (value === 'all' ? ' checked' : '') + '><span>' + side + '</span></label>';
      }),
      '        </fieldset>',
      '      </details>'
    ] : []),
    '      <div>',
    '        <label>Adjust <input type="range" name="' + name + '-slider" min="0" max="64" value="' + value + '" aria-label="' + label + ': adjust"></label>',
    '        <label>Exact value <input type="number" name="' + name + '" min="0" step="any" value="' + value + '" aria-label="' + label + ': exact value"></label>',
    '        <label>Unit <select name="' + name + '-unit" aria-label="' + label + ': unit">',
    ...(edges ? ['          <option value="" disabled>Mixed units</option>'] : []),
    ...spacingUnitGroups.map(([group, units]) => '          <optgroup label="' + group + '">' +
      units.map(unit => '<option' + (unit === 'px' ? ' selected' : '') + '>' + unit + '</option>').join('') +
      '</optgroup>'),
    '        </select></label>',
    '      </div>',
    ...(edges ? ['      <output aria-label="' + label + ' side values">' + value + ' px on all sides</output>'] : []),
    '    </fieldset>'
  ].join('\n');
}

export const wordpressSpacingPreview = [
  '<section id="gutenberg-spacing" class="grid" aria-label="Gutenberg spacing preview">',
  '  <div class="stack">',
  '    <p>Previous block</p>',
  '    <div>',
  '      <article>',
  '        <div><h4>Build a better page</h4><p>An introduction inside the selected Group.</p></div>',
  '      </article>',
  '    </div>',
  '    <p>Next block</p>',
  '    <ul><li>Margin outside the outline</li><li>Padding inside the outline</li><li>Gap between child blocks</li></ul>',
  '  </div>',
  '  <form class="stack">',
  spacingRow('margin', 'Margin', 16, true),
  spacingRow('padding', 'Padding', 24, true),
  spacingRow('gap', 'Block gap', 12, false),
  '    <button type="reset">Reset spacing</button>',
  '  </form>',
  '</section>'
].join('\n');
