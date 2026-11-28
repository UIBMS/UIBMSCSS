import {asset, esc, href} from '../lib/config.mjs';

const topics = [
  {id: 'design', title: 'Design', headline: 'Designing for a slower read', date: '2026-11-27',
    summary: 'A quiet page starts with a clear reading order. Give the headline, lead, and body distinct jobs, and let the prose set the pace.'},
  {id: 'development', title: 'Development', headline: 'A smaller vocabulary for the web', date: '2026-11-25',
    summary: 'Many interfaces already have a useful shape in HTML. Starting with native elements gives keyboards and assistive technology a dependable path through the page.'},
  {id: 'accessibility', title: 'Accessibility', headline: 'What the keyboard reveals', date: '2026-11-21',
    summary: 'Tab through a page from the top. A visible focus indicator and a predictable sequence quickly reveal whether navigation works for readers who never touch a mouse.'}
];
const archive = [
  {id: 'archive', title: 'November archive'},
  {id: 'about', title: 'About the Journal'}
];

export const blogDemo = {
  slug: 'demos/blog',
  title: 'Editorial blog',
  description: 'A blog masthead with a brand logo, topic dropdowns, and a mobile navigation drawer.',
  kind: 'application', standalone: true, sections: [],
  documentation: 'docs/drawer', entry: 'blog-demo', appearance: true,
  stylesheets: ['components/drawer.css', 'icons/icons.css'],
  features: ['Native dropdown navigation', 'Mobile drawer', 'Shared Appearance settings']
};

const sectionLink = ({id, title}) => `<li><a href="#${id}">${esc(title)}</a></li>`;
const menuGroup = (label, entries, name) => `<li><details name="${name}">
    <summary>${esc(label)} <span data-icon="chevron-down" aria-hidden="true"></span></summary>
    <ul>${entries.map(sectionLink).join('')}</ul>
  </details></li>`;

function navigation(name) {
  return `<nav aria-label="Journal navigation"><ul>
    ${sectionLink({id: 'latest', title: 'Latest'})}
    ${menuGroup('Topics', topics, name)}
    ${menuGroup('Explore', archive, name)}
  </ul></nav>`;
}

const posted = new Intl.DateTimeFormat('en', {dateStyle: 'long', timeZone: 'UTC'});

export function renderBlogDemo(base, appearance) {
  return `<header id="journal-header" class="cluster">
    <a href="${href(base, 'demos/blog')}"><img src="${asset(base, 'assets/brand.svg')}" width="32" height="32" alt=""> UIBMS Journal</a>
    ${navigation('journal-desktop')}
    ${appearance}
    <button id="journal-menu" type="button" commandfor="journal-drawer" command="show-modal" aria-controls="journal-drawer" aria-haspopup="dialog" hidden>
      <span data-icon="menu" aria-hidden="true"></span> Menu
    </button>
  </header>
  <dialog id="journal-drawer" class="drawer" aria-labelledby="journal-drawer-title" closedby="any">
    <header class="cluster">
      <h2 id="journal-drawer-title">Journal menu</h2>
      <form method="dialog"><button type="submit" autofocus>Close</button></form>
    </header>
    ${navigation('journal-mobile')}
  </dialog>
  <main id="journal-main">
    <header id="latest" tabindex="-1">
      <h1>UIBMS Journal</h1>
      <p class="lead">Notes on design, development, and a more accessible web.</p>
    </header>
    ${topics.map(({id, title, headline, date, summary}) => `<article id="${id}" tabindex="-1" aria-labelledby="${id}-title">
      <header>
        <small>${esc(title)} · <time datetime="${date}">${posted.format(new Date(date))}</time></small>
        <h2 id="${id}-title">${esc(headline)}</h2>
      </header>
      <p>${esc(summary)}</p>
    </article>`).join('')}
    <section id="archive" tabindex="-1" aria-labelledby="archive-title">
      <h2 id="archive-title">November archive</h2>
      <ul>${topics.map(topic => sectionLink({id: topic.id, title: topic.headline})).join('')}</ul>
    </section>
    <section id="about" tabindex="-1" aria-labelledby="about-title">
      <h2 id="about-title">About the Journal</h2>
      <p>A sample editorial site built with UIBMS CSS.</p>
    </section>
  </main>
  <footer id="journal-footer"><a href="${href(base, 'demos')}">All demos</a> · <a href="${href(base, 'docs/drawer')}">Drawer reference</a></footer>`;
}
