# Optional UIBMS components

Components are separately loadable, HTML-first extensions. Neither the standard nor full core CSS bundles include them. They consume the existing contextual tokens and need no external library. Copy only the files you use.

## Tabs

Load tabs.css and import mountTabs from tabs.mjs. A .tabs element with role="tablist" contains direct native button children with role="tab", unique id and aria-controls. Each referenced panel has role="tabpanel", a unique id, and aria-labelledby equal to its button id. Use type="button". Mark the initial tab aria-selected="true"; give panels meaningful content and tabindex="0" where needed. Leave panels visible in authored HTML so content remains readable without scripting. mountTabs(root) selects the first enabled tab when no enabled selection is declared. It hides other panels with the native hidden attribute and manages roving tabindex. Arrow keys (Left/Right or Up/Down for vertical orientation), Home and End move focus; Enter/Space or click activates. Horizontal navigation follows RTL direction. Disabled tabs are skipped. Tab panels and their contents are never recreated.

Call refresh() after changing tab markup, target IDs, or enabled states. select(tab,{focus:true}) selects a valid enabled tab; destroy() removes delegated listeners and restores authored selection, tabindex and hidden state. Invalid panel mappings are left unenhanced. The controller is scoped to the supplied root and can mount independent tab lists.

## Segmented controls

Load segmented.css. Use .segmented with role="radiogroup" and an accessible group name, direct labels, and one native radio input in each label. Inputs within one group share a name; use unique names for independent groups. Native input checking, arrow navigation, disabled state, form data and reset are authoritative. No JavaScript is required. The radio remains focusable across its full segment; the label provides visible focus and selected feedback.

## Material and design

Both stylesheets inherit palette, theme, density, shape, typography, border and motion settings. Ordinary hover is subtle; pressed feedback uses the loud palette role when available, otherwise the existing accent. The optional Liquid Silicone engine already owns tab group selection and maps native segmented radio selection to the whole segment, not a separate moving dot. Without the material engine the selected state is ordinary CSS. Forced colors retain a visible selection boundary. These are development candidates, not a certified accessibility implementation.

## Dropdown menus

Load dropdown.css and import mountDropdowns from dropdown.mjs (keep floating.mjs beside it). Use one button with aria-haspopup="menu" and popovertarget per .dropdown[role="menu"][popover="auto"]. The menu has a unique ID, tabindex="-1", an accessible name and native buttons or anchors with role="menuitem". Native popover handles outside dismissal. The controller manages focus, arrow keys, Home/End, typeahead, Escape, selection dismissal and viewport placement. Native button/link actions are not replaced. Single-level menus only. Use refresh() after DOM changes and destroy() for cleanup. Modern Popover API required.

## Tooltips

Load tooltip.css and import mountTooltips from tooltip.mjs (shared floating.mjs dependency). Give a focusable element aria-describedby pointing at its own noninteractive .tooltip[role="tooltip"][popover="manual"]. The native description stays associated while closed. Hover delay defaults to 300ms, leave delay to 160ms; keyboard focus shows immediately. Hovering the tooltip keeps it open; Escape closes without moving focus. Do not hide essential instructions in tooltips or place interactive controls inside them. Touch does not synthesize hover. Pass {delay,leaveDelay} and use refresh()/destroy() for lifecycle. Native popover is required. Tooltip geometry remains stable under Liquid Silicone.

Both floating components use a shared geometry/tracking module, inherit contextual design roles and add no code to the released framework CSS distributions.
