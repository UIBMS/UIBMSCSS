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

## Drawers

Load drawer.css. Use a native dialog with class="drawer" for a logical end drawer, add drawer-start for the opposite edge or drawer-bottom for a bottom sheet. A native button with commandfor referencing the dialog ID and command="show-modal" opens it. Optional mountDrawers(root), from drawer.mjs, delegates only unsupported invoker commands to the native showModal API. Close using a native form with method="dialog", Escape, or the native close API. Label dialogs and provide a visible close control. The browser manages modality and focus return; no custom focus trap or global scroll-lock is added. Customize --drawer-width and --drawer-bottom-max. Drawers honor reduced motion and maintain their docked boundary under Liquid Silicone.

## Toast notifications

Load toast.css and import mountToasts(container,{maxVisible:3,labels:{}}) from toast.mjs. The container must be a dedicated initially empty .toasts element, preferably role="region" with an accessible name. show({title,message,tone,duration}) queues a notification and returns {id,dismiss}. Use tones info, success, warning and danger. Text is inserted with textContent, not innerHTML. Default duration is zero (persistent); opt-in positive durations have a five-second minimum and pause on hover, focus and document hiding. Warnings and errors never auto-dismiss. Polite and assertive live regions are created beside the stack; notifications do not take focus when they appear. clear() clears all messages, destroy() restores the container and releases resources. visibleCount and pendingCount expose queue counts. Override --toast-width to customize dimensions. Supported browsers use a native manual popover, escaping ancestor stacking contexts and clipping. The controller promotes the stack after newly opened native overlays; empty stacks leave the top layer. Native modal focus isolation is preserved: mount a stack inside a modal or drawer for interactive notifications within it. Global timed notifications pause when an unrelated native modal is open. Browsers without Popover API support retain a fixed-position fallback with configurable --toast-z-index (default 1000); mount that fallback directly under the document body. The transparent stack is not a Liquid Silicone surface; its individual notifications retain optical feedback.
