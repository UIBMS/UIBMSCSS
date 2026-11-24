/* Small release packager. Native CSS remains the only runtime. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const postcss = require('postcss');
const selectors = require('postcss-selector-parser');
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const scope = '(:where([data-uibms]:not([data-uibms] [data-uibms])))';
const layers = 'reset, defaults, configuration, features, preferences';
const optional = [
    ...['ocean', 'gold', 'forest', 'bordeaux', 'slate', 'royal', 'terracotta'].map(x => `palettes/${x}.css`),
    ...['minimal', 'fluid', 'dynamic'].map(x => `profiles/effects-${x}.css`)
];
const read = file => postcss.parse(fs.readFileSync(file, 'utf8'), { from: file });
const header = () => postcss.parse(`@layer ${layers};\n@layer defaults.contexts;`);

// Only inline the deliberately simple local import format used by the entry point.
const entry = read(path.join(src, 'uibms.css'));
const seen = new Set();
const core = postcss.root();
for (const node of entry.nodes) {
    if (node.type === 'comment') continue;
    if (node.type === 'atrule' && node.name === 'import') {
        const m = /^url\("([a-z0-9/-]+\.css)"\)$/.exec(node.params);
        if (!m || seen.has(m[1]) || optional.includes(m[1])) throw Error(`Invalid import: ${node.params}`);
        seen.add(m[1]);
        const f = path.resolve(src, m[1]);
        if (!f.startsWith(src + path.sep)) throw Error('Import outside source');
        for (const n of read(f).nodes) core.append(n.clone());
    } else if (node.type === 'atrule' && node.name === 'layer' && !node.nodes) core.append(node.clone());
    else throw Error(`Unexpected entry node: ${node}`);
}
const extensions = optional.map(name => ({ name, ast: read(path.join(src, name)) }));
const full = core.clone();
for (const e of extensions) for (const n of e.ast.nodes) full.append(n.clone());

// Build-time scope generation: scope only selector rules, not document-wide keyframes.
// The outermost marker owns initialization; nested markers inherit instead of resetting.
function scoped(ast) {
    const output = postcss.root();
    for (const top of ast.nodes) {
        if (top.type === 'comment') continue;
        if (top.type !== 'atrule' || top.name !== 'layer') throw Error('Expected layer at top level');
        if (!top.nodes) { output.append(top.clone()); continue; }
        const layer = top.clone();
        layer.removeAll();
        const local = postcss.atRule({ name: 'scope', params: scope, nodes: [] });
        const globals = [];
        function take(node, parents = []) {
            if (node.type !== 'atrule') return;
            if (node.name === 'keyframes') {
                if (!/^uibms-[a-z-]+$/.test(node.params)) throw Error('Unqualified keyframes: ' + node.params);
                let hoisted = node.clone({ params: node.params.replace(/^uibms-/, 'uibms-scoped-') });
                for (const parent of parents.slice().reverse()) {
                    const wrapper = parent.clone(); wrapper.removeAll(); wrapper.append(hoisted); hoisted = wrapper;
                }
                globals.push(hoisted); node.remove(); return;
            }
            if (node.nodes) {
                if (!['media', 'supports', 'starting-style'].includes(node.name)) throw Error('Review scoped at-rule: ' + node.name);
                for (const child of [...node.nodes]) take(child, [...parents, node]);
                if (!node.nodes.length) node.remove();
            }
        }
        for (const node of top.nodes) {
            const clone = node.clone(); local.append(clone); take(clone);
        }
        local.walkRules(rule => {
            rule.selector = selectors(sel => {
                sel.walkPseudos(p => { if (p.value === ':root') p.value = ':scope'; });
                // The source uses body only for its document defaults. In a scoped bundle the adoption root takes that role.
                sel.walkTags(t => { if (t.value === 'body') t.replaceWith(selectors.pseudo({ value: ':scope' })); });
                // @scope's implicit anchor excludes its own root in Chromium. Make the
                // root and descendants explicit for each outer rule, retaining specificity.
                if (rule.parent.type !== 'rule' && !rule.selector.includes('&')) {
                    sel.each(branch => {
                        const guard = selectors().astSync(':where(:scope, :scope *)').first.first.clone();
                        if (['tag', 'universal'].includes(branch.first.type)) branch.insertAfter(branch.first, guard);
                        else branch.prepend(guard);
                    });
                }
            }).processSync(rule.selector);
        });
        local.walkDecls(d => {
            if (d.prop === '--_scroll-motion' || d.prop === '--_scroll-progress') d.value = d.value.replace(/\buibms-(?!scoped-)/g, 'uibms-scoped-');
        });
        if (local.nodes.length) layer.append(local);
        for (const g of globals) layer.append(g);
        output.append(layer);
    }
    return output;
}

// Conservative formatting/minification. Keep CSS values, quoted strings, math spaces and token boundaries intact.
// Normalize whitespace outside quoted strings/escapes only, for stable generated output.
function normalize(s) {
    return s.replace(/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\[\s\S]|\/\*[\s\S]*?\*\/|\s+/g, m => /^\s+$/.test(m) ? ' ' : m).trim();
}
function serialize(ast, min) {
    const nl = min ? '' : '\n';
    const sp = min ? '' : ' ';
    function render(n, depth) {
        const indent = min ? '' : '    '.repeat(depth);
        if (n.type === 'comment') return ''; // generated banner identifies the maintained source
        if (n.type === 'decl') {
            const value = n.raws.value && n.raws.value.value === n.value ? n.raws.value.raw : n.value;
            return `${indent}${n.prop}:${sp}${normalize(value)}${n.important ? ' !important' : ''};${nl}`;
        }
        let head;
        if (n.type === 'rule') head = selectors().processSync(normalize(n.selector), { lossless: false });
        else if (n.type === 'atrule') head = '@' + n.name + (n.params ? ' ' + normalize(n.params) : '');
        else throw Error('Unexpected CSS node ' + n.type);
        if (!n.nodes) return indent + head + ';' + nl;
        return indent + head + sp + '{' + nl + n.nodes.map(x => render(x, depth + 1)).join('') + indent + '}' + nl;
    }
    return (min ? '/* UIBMS CSS | generated */' : '/* UIBMS CSS | generated from native source by tools/build.cjs */\n') + ast.nodes.map(n => render(n, 0)).join('') + (min ? '\n' : '');
}
const files = new Map();
function emit(name, ast) {
    files.set(name + '.css', serialize(ast, false));
    files.set(name + '.min.css', serialize(ast, true));
}
emit('uibms', core);
emit('uibms.full', full);
emit('uibms.scoped', scoped(core));
emit('uibms.scoped.full', scoped(full));
for (const e of extensions) {
    const ast = header(); for (const n of e.ast.nodes) ast.append(n.clone());
    const name = 'extensions/' + e.name.replace(/\.css$/, '');
    emit(name, ast);
    emit(name + '.scoped', scoped(ast));
}
const sizes = {};
for (const [name, css] of files) {
    const file = path.join(dist, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, css);
    sizes[name] = { bytes: Buffer.byteLength(css), gzip: zlib.gzipSync(css, { level: 9 }).length, sha256: crypto.createHash('sha256').update(css).digest('hex') };
}
fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify({ coreModules: seen.size, optionalModules: extensions.length, files: sizes }, null, 2) + '\n');
console.log(`Generated ${files.size} stylesheets (${seen.size} core modules, ${extensions.length} optional modules).`);
