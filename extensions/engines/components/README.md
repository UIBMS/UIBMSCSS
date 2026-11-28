# Optional UIBMS components

Components are separately loadable, HTML-first extensions. Prefer a single meaningful component class, native child elements and contextual CSS nesting. Legacy descendant classes remain supported during migration. Neither the standard nor full core CSS bundles include them. They consume the existing contextual tokens and need no external library. Copy only the files you use.

## Tabs

Load tabs.css and import mountTabs from tabs.mjs. A .tabs element with role="tablist" contains direct native button children with role="tab", unique id and aria-controls. Each referenced panel has role="tabpanel", a unique id, and aria-labelledby equal to its button id. Use type="button". Mark the initial tab aria-selected="true"; give panels meaningful content and tabindex="0" where needed. Leave panels visible in authored HTML so content remains readable without scripting. mountTabs(root) selects the first enabled tab when no enabled selection is declared. It hides other panels with the native hidden attribute and manages roving tabindex. Arrow keys (Left/Right or Up/Down for vertical orientation), Home and End move focus; Enter/Space or click activates. Horizontal navigation follows RTL direction. Disabled tabs are skipped. Tab panels and their contents are never recreated.

Call refresh() after changing tab markup, target IDs, or enabled states. select(tab,{focus:true}) selects a valid enabled tab; destroy() removes delegated listeners and restores authored selection, tabindex and hidden state. Invalid panel mappings are left unenhanced. The controller is scoped to the supplied root and can mount independent tab lists.

## Segmented controls

Load segmented.css. Use .segmented with role="radiogroup" and an accessible group name, direct labels, and one native radio input in each label. Inputs within one group share a name; use unique names for independent groups. Native input checking, arrow navigation, disabled state, form data and reset are authoritative. No JavaScript is required. The radio remains focusable across its full segment; the label provides visible focus and selected feedback.

## Material and design

Both stylesheets inherit palette, theme, density, shape, typography, border and motion settings. Ordinary hover is subtle; pressed feedback uses the loud palette role when available, otherwise the existing accent. The optional Liquid Silicone engine already owns tab group selection and maps native segmented radio selection to the whole segment, not a separate moving dot. Without the material engine the selected state is ordinary CSS. Forced colors retain a visible selection boundary. These are development candidates, not a certified accessibility implementation.

## Dropdown menus

Load dropdown.css and import mountDropdowns from dropdown.mjs (keep floating.mjs beside it). Use one button with aria-haspopup="menu" and popovertarget per .dropdown[role="menu"][popover="auto"]. The menu has a unique ID, tabindex="-1", an accessible name and native buttons or anchors with role="menuitem". Native popover handles outside dismissal. CSS anchors position the menu next to its invoker where supported. The shared geometry module supplies fallback placement. The controller manages focus, arrow keys, Home/End, typeahead, Escape, selection dismissal and viewport placement. Native button/link actions are not replaced. Single-level menus only. Use refresh() after DOM changes and destroy() for cleanup. Modern Popover API required.

## Tooltips

Load tooltip.css and import mountTooltips from tooltip.mjs (shared floating.mjs dependency). Give a focusable element aria-describedby pointing at its own noninteractive .tooltip[role="tooltip"][popover="manual"]. The native description stays associated while closed. Hover delay defaults to 300ms, leave delay to 160ms; keyboard focus shows immediately. Hovering the tooltip keeps it open; Escape closes without moving focus. Do not hide essential instructions in tooltips or place interactive controls inside them. Touch does not synthesize hover. Pass {delay,leaveDelay} and use refresh()/destroy() for lifecycle. Native popover is required. Tooltip geometry remains stable under Liquid Silicone.

Both floating components use a shared geometry/tracking module, inherit contextual design roles and add no code to the released framework CSS distributions.

## Drawers

Load drawer.css. Use a native dialog with class="drawer" for a logical end drawer, add drawer-start for the opposite edge or drawer-bottom for a bottom sheet. A native button with commandfor referencing the dialog ID and command="show-modal" opens it. Optional mountDrawers(root), from drawer.mjs, delegates only unsupported invoker commands to the native showModal API. When both native dialog commands and closedBy are supported, the website skips loading this adapter entirely. Close using a native form with method="dialog", Escape, or the native close API. Label dialogs and provide a visible close control. The browser manages modality and focus return; no custom focus trap or global scroll-lock is added. Native closedby="any" optionally enables backdrop dismissal (the compatibility controller only fills missing native support). Navigation drawers use the same component and native command invokers. CSS controls responsive trigger visibility; if a responsive invoker disappears while its drawer is modal, close the dialog rather than hiding an active modal with CSS. Customize --drawer-width and --drawer-bottom-max. Drawers honor reduced motion and maintain their docked boundary under Liquid Silicone.

## Toast notifications

Load toast.css and import mountToasts(container,{maxVisible:3,labels:{}}) from toast.mjs. The container must be a dedicated initially empty .toasts element, preferably role="region" with an accessible name. show({title,message,tone,duration}) queues a notification and returns {id,dismiss}. Use tones info, success, warning and danger. Text is inserted with textContent, not innerHTML. Default duration is zero (persistent); opt-in positive durations have a five-second minimum and pause on hover, focus and document hiding. Warnings and errors never auto-dismiss. Polite and assertive live regions are created beside the stack; notifications do not take focus when they appear. clear() clears all messages, destroy() restores the container and releases resources. visibleCount and pendingCount expose queue counts. Override --toast-width to customize dimensions. Supported browsers use a native manual popover, escaping ancestor stacking contexts and clipping. The controller promotes the stack after newly opened native overlays; empty stacks leave the top layer. Native modal focus isolation is preserved: mount a stack inside a modal or drawer for interactive notifications within it. Global timed notifications pause when an unrelated native modal is open. Browsers without Popover API support retain a fixed-position fallback with configurable --toast-z-index (default 1000); mount that fallback directly under the document body. The transparent stack is not a Liquid Silicone surface; its individual notifications retain optical feedback.

## Stepper

Load stepper.css and import mountStepper from stepper.mjs when necessary. Use an ordered list with native links, spans or buttons. Mark the active step with aria-current="step". The optional controller maps native buttons to labelled panels, preserves DOM nodes and values, and leaves authored panels readable without scripting. The application owns validation, eligibility, completion and final submission.

mountStepper(list,{scope:list.parentElement}) provides current (zero-based), go(index,{focus:false}), next(), previous(), refresh() and destroy(). Each button has a unique ID and aria-controls pointing to a native section with aria-labelledby pointing back to its button. The legacy .stepper-panel class remains supported. Disabled steps cannot be selected. Cancel beforestepchange to enforce application rules; stepchange reports successful navigation. This is panel navigation, not automatic form validation.

## Pagination

Load pagination.css and import mountPagination from pagination.mjs when necessary. Native links support server-side navigation without JavaScript. For local paging, the optional controller creates real buttons, a bounded page window and ellipses, updates aria-current, and preserves focus. Try navigating the 100 sample records. Applications supply their own data; the framework performs no network requests.

mountPagination(nav,{current:1,total:1,siblings:1,onChange,labels}) expects an empty labelled nav. setPage(), setTotal(), current, total and destroy() control navigation. Setting the same normalized total is a no-op, preserving the existing controls and focus. beforepagechange is cancelable; pagechange and onChange report selection. pageWindow(current,total,siblings) is a pure helper returning page numbers and ellipsis markers.

## Tags and chips

Load chips.css and import mountChips from chips.mjs when necessary. Tags are descriptive text: use a ul.tags with native li children. Selectable chips use .chips with direct labels containing native checkboxes; removable chips use ul.chips with direct li children and separate native buttons. Standalone .tag and .chip classes remain available when there is no group. data-tone optionally supplies a semantic colour. The delegated removal helper reports the removed value, supports cancelation and transfers focus to a neighbouring remove button. Restore belongs to this demo, not the library.

mountChips(container) expects .chips with direct list items containing a separate button named remove-chip. Legacy direct .chip children remain supported. remove(button) dispatches cancelable beforechipremove, removes the chip, then dispatches chipremove with detail.value and detail.chip. destroy() removes listeners and restores the original container tabindex. Removal changes the DOM and is not undone by form reset.

## Command palette

Load command.css and import mountCommandPalette from command.mjs when necessary. Open the native modal and search its real buttons or links. Give the search input aria-controls pointing to a uniquely identified ul inside the dialog (directly or in its immediate .stack). No results class is needed; legacy .command-results remains supported. Matching is case- and accent-insensitive; every word must match. Arrow keys move between the search field and enabled results, Home and End navigate results, and Enter activates a result. Escape and the close button use native dialog dismissal. The component inherits contextual styles and existing Liquid Silicone overlays.

mountCommandPalette(dialog,{shortcut:true}) optionally enables Ctrl/Cmd+K outside editable fields and other modals. The docs demo keeps the existing site search shortcut, so use its open button. open(), close(), refresh() and destroy() manage lifecycle. commandselect is cancelable to keep the palette open without suppressing the actual application action. The application owns its command registry, routing and remote data.

## Advanced tables

Load the core CSS and import `mountDataTable(table, {fields, controls, search, reset, status})` from `data-table.mjs`. Author a caption, a single header row with plain column labels, and one body with one cell per column. Use row headers for record names. Supply field keys in column order. Keep the first column as the record identifier.

Pass a native form as `controls`, a search input, a reset button with `type="button"`, and a separate result live region. Hide the form in authored HTML until the controller loads. Give each column checkbox `name="columns"` and a field key as its value. Omit the first field from that group. Filter controls use the corresponding field key as their name. Text filters match substrings, selects match exact values, and date inputs match dates on or after the selection. Provide dates with `<time datetime="YYYY-MM-DD">` and numeric values with `<data value="…">` for sorting. Global search uses the displayed values from all columns, including hidden columns; combined filters narrow the same record set. Column selection never removes the corresponding field filter.

The controller captures the authored rows at mount, enhances sortable headers with native buttons and reports sort direction with `aria-sort`. Load the optional `icons/icons.css` stylesheet to show the active sort arrow. Reset restores checkbox and filter defaults and the original row order. The application owns loading or replacing datasets. Keep a labelled, keyboard-focusable scroll region when the data needs the extra space. No component stylesheet or framework-specific class is required.

## Derived geometry (GEO-002)

Segmented controls and dropdown menus derive their inset corners from the actual owner radius, border and padding. Chips reserve their existing minimum remove-target size and compensate for padding with logical margins, so direction does not require separate styles. Step counters follow the line height and accommodate multiple digits. Pagination accepts a direct decorative SVG with a viewBox and no authored dimensions; the icon follows the local font metrics. Toast dismissal and motion use the notification's own geometry and the motion-distance token. Tooltip width also respects a readable character measure. These relationships are local to the existing component, do not add consumer classes, and leave the native states and controllers authoritative. See [GEO-002](../../../docs/ARCHITECTURE.md#geo-002--mathematically-derived-contextual-geometry).

For optional controls loaded with the scoped bundle, use one existing component-owner class of specificity when necessary to beat scoped native defaults. Keep the semantic descendants in `:where()`. This preserves author overrides without additional classes, separate scoped component stylesheets or `!important`.
