# Optional dashboard layout extension

Development candidate; MIT. Load only the modules you need after UIBMSCSS. No runtime dependency, router, data model or visual framework is imposed. The released CSS bundles are unchanged.

## App Shell

Load app-shell.css; use .app-shell > .app-shell-grid with direct .dashboard-topbar, .dashboard-sidebar and .dashboard-workspace children. Use semantic header, aside and main in a real application (a labelled section can be used in an embedded preview). The sidebar has a unique ID. A native button.sidebar-toggle in the topbar has aria-controls pointing to it and aria-expanded. Provide an accessible name. Import mountAppShell(shell,{expanded:true,mobileExpanded:false}) from app-shell.mjs for collapse/expand. With no JS, the sidebar is visible and the toggle is hidden. At the shell's own width of 42rem or more, an expanded sidebar becomes an icon rail when collapsed; below that width it becomes a disclosure in the shell. Wrap link labels in .sidebar-label and provide an aria-hidden .sidebar-icon so compact links retain accessible names. Desktop and compact preferences are independent. Escape closes an open compact sidebar when focus is in the sidebar or on the toggle; focus returns to the toggle. Application navigation remains native. setExpanded(value), refresh(), mode, expanded and destroy() are available; sidebarvisibilitychange reports mode and expanded state. No persistence is imposed.

Layout tokens: --dashboard-height (100dvh), --dashboard-sidebar-width (15rem), --dashboard-rail-width (4rem), --dashboard-content-padding (var(--space)), --dashboard-mobile-nav-height (14rem). Use a definite shell height for independently scrollable sidebar and workspace. A narrow shell keeps the sidebar in its own grid row rather than opening a modal or covering content. The 42rem breakpoint is a CSS container query and can be changed in the optional stylesheet.

## Sidebar

Load sidebar.css. Use .dashboard-sidebar containing a labelled nav.sidebar-nav with native lists, links and details/summary for nested groups. Mark the current link with aria-current="page"; only the application chooses the active route. Sidebar background/foreground can be customized using --dashboard-sidebar-background and --dashboard-sidebar-foreground. The full link name is preserved in the collapsed shell.

## Topbar

Load topbar.css. .dashboard-topbar accepts ordinary native headings, search, buttons and links in .topbar-brand and .topbar-actions. Groups wrap at narrow widths. Use existing independently loadable dropdown, drawer, toast and command palette extensions when needed.

## Page header

Load page-header.css. .dashboard-page-header contains .page-heading and .page-actions. Native .dashboard-breadcrumb nav with an ordered list provides location context; native headings and links stay intact. Actions wrap without a required icon set or placement policy.

## Split workspace

Load split-workspace.css. .split-workspace > .split-workspace-grid contains .split-pane, .split-handle[role="separator"], .split-pane, in that order. Give the handle an accessible name, aria-controls pointing to the primary pane, and tabindex="-1" before mounting. Import mountSplitWorkspace(root,{ratio:.42,minStart:160,minEnd:220,keyboardStep:.05}) from split-workspace.mjs. Pointer drag uses pointer capture; Left/Right and Home/End adjust the split with logical RTL support. Limits are computed from actual available width; the ratio is preserved when the container stacks below 36rem. The handle is hidden in stacked mode. Without JS, panels retain a static ratio and the handle is hidden. setRatio(value), ratio, refresh() and destroy() are available; splitresize reports the applied ratio. Use --dashboard-split-ratio and --dashboard-split-gutter to customize defaults. This is a layout component, not a record editor or drag-and-drop data engine.

All five structures inherit appearance tokens. Layout-defining shell, sidebar, topbar, workspace and splitter boundaries stay stable when Liquid Silicone is enabled; nested ordinary surfaces, navigation selection and native controls retain material feedback. Browser and accessibility certification remain outstanding.
