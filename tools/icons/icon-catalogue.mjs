// UIBMS artwork. Each entry is [name, accessible label, SVG geometry].
// A 24-unit grid and rounded 1.75-unit strokes keep the set consistent.
export const iconGroups = {
  Navigation: [
    ['menu', 'Menu', '<path d="M5 8h14m-14 8h14"/>'],
    ['close', 'Close', '<path d="m6 6 12 12M18 6 6 18"/>'],
    ['arrow-up', 'Arrow up', '<path d="M12 19V5m-6 6 6-6 6 6"/>'],
    ['arrow-right', 'Arrow right', '<path d="M5 12h14m-6-6 6 6-6 6"/>'],
    ['arrow-down', 'Arrow down', '<path d="M12 5v14m-6-6 6 6 6-6"/>'],
    ['arrow-left', 'Arrow left', '<path d="M19 12H5m6-6-6 6 6 6"/>'],
    ['chevron-right', 'Chevron right', '<path d="m9 5 7 7-7 7"/>'],
    ['chevron-down', 'Chevron down', '<path d="m5 9 7 7 7-7"/>']
  ],
  Actions: [
    ['plus', 'Plus', '<path d="M12 5v14M5 12h14"/>'],
    ['minus', 'Minus', '<path d="M5 12h14"/>'],
    ['search', 'Search', '<circle cx="10.5" cy="10.5" r="5.75"/><path d="m15 15 4.7 4.7"/>'],
    ['filter', 'Filter', '<path d="M4 6h16l-6.5 7.2v4.5l-3 1.8v-6.3z"/>'],
    ['settings', 'Settings', '<polygon points="9.6,6.1 10.6,5.8 10.6,3.9 13.4,3.9 13.4,5.8 14.4,6.1 15.4,6.6 16.7,5.3 18.7,7.3 17.4,8.6 17.9,9.6 18.2,10.6 20.1,10.6 20.1,13.4 18.2,13.4 17.9,14.4 17.4,15.4 18.7,16.7 16.7,18.7 15.4,17.4 14.4,17.9 13.4,18.2 13.4,20.1 10.6,20.1 10.6,18.2 9.6,17.9 8.6,17.4 7.3,18.7 5.3,16.7 6.6,15.4 6.1,14.4 5.8,13.4 3.9,13.4 3.9,10.6 5.8,10.6 6.1,9.6 6.6,8.6 5.3,7.3 7.3,5.3 8.6,6.6"/><circle cx="12" cy="12" r="2.3"/>'],
    ['edit', 'Edit', '<path d="m4.5 19.5 4.2-1 9.7-9.7a2.1 2.1 0 0 0-3-3L5.7 15.5zM13.9 7.4l3 3"/>'],
    ['copy', 'Copy', '<rect x="8" y="7" width="11" height="13" rx="2"/><path d="M15 7V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/>'],
    ['trash', 'Trash', '<path d="M4.5 7h15M9 7V4.5h6V7m-8.5 0 .7 11a2 2 0 0 0 2 2h5.6a2 2 0 0 0 2-2l.7-11M10 10.5v5.8m4-5.8v5.8"/>']
  ],
  'Files and links': [
    ['folder', 'Folder', '<path d="M4.5 8.5V6.8A1.8 1.8 0 0 1 6.3 5H10l2.2 2.5h5.5A1.8 1.8 0 0 1 19.5 9.3v7.9a1.8 1.8 0 0 1-1.8 1.8H6.3a1.8 1.8 0 0 1-1.8-1.8z"/>'],
    ['file', 'File', '<path d="M7 4h6.5L18 8.5V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm6 0v5h5M8.5 13h6.5m-6.5 3h5"/>'],
    ['image', 'Image', '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.25"/><path d="m5 17 4.4-4 3.3 2.6 3.1-3.6 3.4 3"/>'],
    ['download', 'Download', '<path d="M12 4v10m-4-4 4 4 4-4m-11.5 5v3a1.7 1.7 0 0 0 1.7 1.7h11.6a1.7 1.7 0 0 0 1.7-1.7v-3"/>'],
    ['upload', 'Upload', '<path d="M12 14V4m-4 4 4-4 4 4m-11.5 7v3a1.7 1.7 0 0 0 1.7 1.7h11.6a1.7 1.7 0 0 0 1.7-1.7v-3"/>'],
    ['external-link', 'External link', '<path d="M12 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5m-7 0 7-7m-5 0h5v5"/>'],
    ['link', 'Link', '<path d="m10 8 2.7-2.6a3.7 3.7 0 0 1 5.3 5.2l-2.7 2.7m-1.3 2.7-2.7 2.6A3.7 3.7 0 0 1 6 13.4l2.7-2.7m.7 3.9 5.2-5.2"/>'],
    ['archive', 'Archive', '<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M5.5 9v8.3A1.7 1.7 0 0 0 7.2 19h9.6a1.7 1.7 0 0 0 1.7-1.7V9m-8.5 4h4"/>']
  ],
  Status: [
    ['check', 'Check', '<path d="m5 12.5 4.1 4.2L19 7"/>'],
    ['circle-check', 'Confirmed', '<circle cx="12" cy="12" r="8"/><path d="m8.3 12.3 2.4 2.5 5-5.1"/>'],
    ['info', 'Information', '<circle cx="12" cy="12" r="8"/><path d="M12 11.5v4.3M12 8.3h.01"/>'],
    ['warning', 'Warning', '<path d="M10.5 5.3a1.7 1.7 0 0 1 3 0l6.6 11.5a1.7 1.7 0 0 1-1.5 2.5H5.4a1.7 1.7 0 0 1-1.5-2.5zM12 9.5v3.2m0 3.5h.01"/>'],
    ['circle-x', 'Error', '<circle cx="12" cy="12" r="8"/><path d="m9.3 9.3 5.4 5.4m0-5.4-5.4 5.4"/>'],
    ['help', 'Help', '<circle cx="12" cy="12" r="8"/><path d="M9.6 9.7a2.5 2.5 0 0 1 4.9.4c0 1.7-2.5 2-2.5 3.6m0 2.7h.01"/>'],
    ['prohibited', 'Prohibited', '<circle cx="12" cy="12" r="8"/><path d="m6.3 6.3 11.4 11.4"/>'],
    ['refresh', 'Refresh', '<path d="M19 9a7.3 7.3 0 0 0-12.6-2L4.7 9m0-4v4h4m-3.7 6a7.3 7.3 0 0 0 12.6 2l1.7-2m0 4v-4h-4"/>']
  ],
  Media: [
    ['play', 'Play', '<path d="M8 5.5 18.5 12 8 18.5z"/>'],
    ['pause', 'Pause', '<rect x="7" y="5.5" width="3.4" height="13" rx="1"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1"/>'],
    ['stop', 'Stop', '<rect x="6" y="6" width="12" height="12" rx="1.5"/>'],
    ['volume', 'Volume', '<path d="M4 9h3.2l4.3-3.5v13L7.2 15H4Zm10.4.2a4 4 0 0 1 0 5.6m2.6-8a7 7 0 0 1 0 10.4"/>'],
    ['volume-off', 'Mute', '<path d="M4 9h3.2l4.3-3.5v13L7.2 15H4Zm11 1 4 4m0-4-4 4"/>'],
    ['camera', 'Camera', '<path d="M6 7h2.5l1.3-2h4.4l1.3 2H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.3"/>'],
    ['video', 'Video', '<rect x="4" y="7" width="11" height="10" rx="2"/><path d="m15 10.1 5-2.4v8.6l-5-2.4"/>'],
    ['headphones', 'Headphones', '<path d="M5 13v-1a7 7 0 0 1 14 0v1"/><rect x="5" y="12" width="3.4" height="6" rx="1.3"/><rect x="15.6" y="12" width="3.4" height="6" rx="1.3"/>']
  ],
  Communication: [
    ['mail', 'Mail', '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="m4.8 7.7 5.8 4.5a2.3 2.3 0 0 0 2.8 0l5.8-4.5"/>'],
    ['message', 'Message', '<path d="M8 5.5h8a4 4 0 0 1 4 4v2.2a4 4 0 0 1-4 4h-4.5L7 19v-3.4a4 4 0 0 1-3-3.9V9.5a4 4 0 0 1 4-4Z"/><path d="M8 10.7h.01m4 0h.01m4 0h.01"/>'],
    ['bell', 'Notifications', '<path d="M7 10a5 5 0 1 1 10 0c0 3.5 1.2 4.6 2 5.7H5c.8-1.1 2-2.2 2-5.7Zm3 8.5a2 2 0 0 0 4 0"/>'],
    ['send', 'Send', '<path d="m4 10.4 15.5-5.9-4.2 15-3.8-6.2L4 10.4Zm7.5 2.9 8-8.8"/>'],
    ['user', 'User', '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19v-.8a4.7 4.7 0 0 1 4.7-4.7h3.6a4.7 4.7 0 0 1 4.7 4.7v.8"/>'],
    ['users', 'Users', '<circle cx="9.3" cy="8.3" r="3"/><path d="M4 18.7v-.7a4.4 4.4 0 0 1 4.4-4.4h1.8a4.4 4.4 0 0 1 4.4 4.4v.7m.2-13.2a3 3 0 0 1 0 5.6m2 2.8a4.3 4.3 0 0 1 3.2 4.1v.7"/>'],
    ['share', 'Share', '<circle cx="6" cy="12" r="2.25"/><circle cx="17.5" cy="6" r="2.25"/><circle cx="17.5" cy="18" r="2.25"/><path d="m8 11 7.4-3.9M8 13l7.4 3.9"/>'],
    ['globe', 'Globe', '<circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="3.3" ry="8"/><path d="M4 12h16"/>']
  ],
  Workspace: [
    ['home', 'Home', '<path d="m4 11 8-6.5 8 6.5m-2-1.6V19h-4v-5h-4v5H6V9.4"/>'],
    ['grid', 'Grid', '<rect x="4.5" y="4.5" width="6" height="6" rx="1.25"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.25"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.25"/><rect x="13.5" y="13.5" width="6" height="6" rx="1.25"/>'],
    ['list', 'List', '<path d="M4.5 6.5h.01m0 5.5h.01m0 5.5h.01M8 6.5h11.5M8 12h11.5M8 17.5h11.5"/>'],
    ['calendar', 'Calendar', '<rect x="4.5" y="6" width="15" height="13.5" rx="2"/><path d="M8.5 4v4m7-4v4m-11 2h15m-10 4h1m3 0h1m-5 2.5h1"/>'],
    ['clock', 'Clock', '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v4.7l3 1.8"/>'],
    ['table', 'Table', '<rect x="4" y="5.5" width="16" height="13" rx="1.5"/><path d="M4 10h16M4 14.3h16M10 10v8.5m4.7-8.5v8.5"/>'],
    ['chart-bar', 'Bar chart', '<path d="M5 5v14h14m-10-4v-3m4 3V8m4 7v-5"/>'],
    ['chart-line', 'Line chart', '<path d="M5 5v14h14m-10-5 3-3 2.5 1.7L19 8.3"/>']
  ],
  'Access and favorites': [
    ['lock', 'Lock', '<rect x="5.5" y="10" width="13" height="9.5" rx="2"/><path d="M8.5 10V8a3.5 3.5 0 1 1 7 0v2m-3.5 4v2"/>'],
    ['unlock', 'Unlock', '<rect x="5.5" y="10" width="13" height="9.5" rx="2"/><path d="M8.5 10V8a3.5 3.5 0 0 1 6.8-1.1M12 14v2"/>'],
    ['eye', 'Show', '<path d="M3.5 12S6.2 6.4 12 6.4s8.5 5.6 8.5 5.6-2.7 5.6-8.5 5.6S3.5 12 3.5 12Z"/><circle cx="12" cy="12" r="2.4"/>'],
    ['eye-off', 'Hide', '<path d="m4.5 4.5 15 15M9.7 6.6a9 9 0 0 1 2.3-.2c5.8 0 8.5 5.6 8.5 5.6a13 13 0 0 1-2.3 2.9m-2.4 1.8a8.5 8.5 0 0 1-3.8.9c-5.8 0-8.5-5.6-8.5-5.6a13 13 0 0 1 3-3.6m3.8 1.9a2.4 2.4 0 0 0 3.4 3.4"/>'],
    ['star', 'Star', '<path d="m12 4.4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/>'],
    ['heart', 'Heart', '<path d="M12 19.2 5.6 13a4.2 4.2 0 0 1 5.9-6l.5.6.5-.6a4.2 4.2 0 0 1 5.9 6z"/>'],
    ['bookmark', 'Bookmark', '<path d="M7.5 4.5h9A1.5 1.5 0 0 1 18 6v13.5l-6-3.7-6 3.7V6a1.5 1.5 0 0 1 1.5-1.5Z"/>'],
    ['shield', 'Shield', '<path d="M12 4.5 19 7v4.4c0 4-2.8 6.5-7 8.1-4.2-1.6-7-4.1-7-8.1V7Zm-2.7 7.4 1.8 1.9 3.7-3.8"/>']
  ]
};

export const icons = Object.values(iconGroups).flat();
