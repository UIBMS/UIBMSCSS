import {asset, esc, href} from '../lib/config.mjs';

const journal = 'demos/blog';
const archive = `${journal}/archive`;
const topics = new Map([
  ['design', 'Design'],
  ['development', 'Development'],
  ['accessibility', 'Accessibility']
]);

const posts = [
  {
    slug: 'designing-for-a-slower-read', topic: 'design', anchor: 'design', date: '2026-11-27',
    title: 'Designing for a slower read',
    summary: 'A quiet page starts with a clear reading order. Give the headline, lead, and body distinct jobs, and let the prose set the pace.',
    body: [
      'Start by laying out the article without its images. Read the title, introduction, and section headings in order. If that sequence makes sense by itself, the design has a clear structure to work with.',
      'Give each paragraph a comfortable reading width. Let the article breathe around changes in subject, and keep captions close to the figures they describe. Those small relationships matter more than a perfectly uniform grid.'
    ]
  },
  {
    slug: 'a-smaller-vocabulary-for-the-web', topic: 'development', anchor: 'development', date: '2026-11-25',
    title: 'A smaller vocabulary for the web',
    summary: 'Many interfaces already have a useful shape in HTML. Starting with native elements gives keyboards and assistive technology a dependable path through the page.',
    body: [
      'An archive is a list of links. That description is enough to choose its main ingredients before you pick a layout. Use headings for the groups and links for the posts, then add spacing and typography in CSS.',
      'Try turning off the stylesheet and opening a post. The list should still make sense. Then turn off JavaScript and try again. Each successful visit tells you that a reader can reach the article with fewer dependencies.'
    ]
  },
  {
    slug: 'what-the-keyboard-reveals', topic: 'accessibility', anchor: 'accessibility', date: '2026-11-21',
    title: 'What the keyboard reveals',
    summary: 'Tab through a page from the top. A visible focus indicator and a predictable sequence quickly reveal whether navigation works for readers who never touch a mouse.',
    body: [
      'Start at the logo and tab forward through the header. Open a topic with Enter, then move into its links. If Escape closes the dropdown, focus should return to the control that opened it.',
      'Repeat the exercise on a narrow screen. Open the navigation drawer, follow a link, and continue with Tab. Check where focus ends up after each action and whether you can tell which part of the page is active.'
    ]
  },
  {
    slug: 'dates-that-travel-with-stories', topic: 'development', date: '2026-10-28',
    title: 'Dates that travel with stories',
    summary: 'Keep a publication date with the post and use it wherever the post appears.',
    body: [
      'Store publication dates in a format the site can sort. Format them for people at the point of display and keep the original value in the time element.',
      'When a story appears on the homepage, in an archive, and on its own page, all three can show the same date. An editorial correction then has one place to land.'
    ]
  },
  {
    slug: 'the-space-between-headings', topic: 'design', date: '2026-10-14',
    title: 'The space between headings',
    summary: 'Use spacing to show which pieces of an article belong together.',
    body: [
      'A heading belongs visually to the text that follows it. Leave more space before a new subject than between its heading and the first paragraph.',
      'Check that relationship at a larger text size. The reading rhythm should remain clear even when a heading wraps to two lines.'
    ]
  }
].sort((a, b) => b.date.localeCompare(a.date));

const journalPage = {
  kind: 'application', standalone: true, sections: [],
  documentation: 'docs/drawer', entry: 'blog-demo', appearance: true,
  stylesheets: ['components/drawer.css', 'icons/icons.css']
};

export const blogDemo = {
  ...journalPage, slug: journal, view: 'home', title: 'Editorial blog',
  description: 'A blog masthead with a brand logo, topic dropdowns, and a mobile navigation drawer.',
  features: ['Native dropdown navigation', 'Mobile drawer', 'Post archive and article pages']
};

const topicPage = topic => `${archive}/${topic}`;
const articlePage = post => `${journal}/posts/${post.slug}`;

export const journalPages = [
  {...journalPage, slug: archive, view: 'archive', title: 'Article archive',
    description: 'Browse all UIBMS Journal articles by publication month or topic.'},
  ...[...topics].map(([topic, title]) => ({
    ...journalPage, slug: topicPage(topic), view: 'archive', topic, title,
    description: `Browse UIBMS Journal articles on ${title.toLowerCase()}.`
  })),
  ...posts.map(post => ({
    ...journalPage, slug: articlePage(post), view: 'post', post, title: post.title, description: post.summary
  }))
];

const monthFormat = new Intl.DateTimeFormat('en', {month: 'long', year: 'numeric', timeZone: 'UTC'});
const dateFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long', timeZone: 'UTC'});
const journalLink = (base, slug, label, current, fragment = '') =>
  `<a href="${href(base, slug)}${fragment}"${!fragment && current === slug ? ' aria-current="page"' : ''}>${esc(label)}</a>`;

function navigation(base, name, page) {
  const item = ([slug, title, fragment]) => `<li>${journalLink(base, slug, title, page.slug, fragment)}</li>`;
  const group = (label, items) => `<li><details name="${name}">
    <summary>${label} <span data-icon="chevron-down" aria-hidden="true"></span></summary>
    <ul>${items.map(item).join('')}</ul>
  </details></li>`;

  return `<nav aria-label="Journal navigation"><ul>
    ${item([journal, 'Latest'])}
    ${group('Topics', [...topics].map(([id, title]) => [topicPage(id), title]))}
    ${group('Explore', [[archive, 'All posts'], [journal, 'About the Journal', '#about']])}
  </ul></nav>`;
}

const metadata = (base, post) => `<small><time datetime="${post.date}">${dateFormat.format(new Date(post.date))}</time>
  · ${journalLink(base, topicPage(post.topic), topics.get(post.topic))}</small>`;

function preview(base, post, heading, anchor) {
  return `<article${anchor ? ` id="${anchor}"` : ''}>
    <header>${metadata(base, post)}
      <${heading}>${journalLink(base, articlePage(post), post.title)}</${heading}>
    </header>
    <p>${esc(post.summary)}</p>
  </article>`;
}

function home(base) {
  return `<header id="latest" tabindex="-1">
    <h1>UIBMS Journal</h1>
    <p class="lead">Notes on design, development, and a more accessible web.</p>
    <p id="archive">${journalLink(base, archive, 'Browse all posts')}</p>
  </header>
  ${posts.slice(0, 3).map(post => preview(base, post, 'h2', post.anchor)).join('')}
  <section id="about" tabindex="-1" aria-labelledby="about-title">
    <h2 id="about-title">About the Journal</h2>
    <p>A sample editorial site built with UIBMS CSS.</p>
  </section>`;
}

function archiveView(base, page) {
  const months = new Map();
  for (const post of posts) {
    if (page.topic && post.topic !== page.topic) continue;
    const month = post.date.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(post);
  }
  return `<header>
    <h1>${esc(page.title)}</h1>
    <nav aria-label="Filter posts by topic">
      <ul class="cluster" role="list">
        <li>${journalLink(base, archive, 'All posts', page.slug)}</li>
        ${[...topics].map(([id, title]) => `<li>${journalLink(base, topicPage(id), title, page.slug)}</li>`).join('')}
      </ul>
    </nav>
  </header>
  ${[...months].map(([month, entries]) => `<section aria-labelledby="month-${month}">
    <h2 id="month-${month}">${monthFormat.format(new Date(entries[0].date))}</h2>
    <ul role="list">${entries.map(post => `<li>${preview(base, post, 'h3')}</li>`).join('')}</ul>
  </section>`).join('')}`;
}

function article(base, post) {
  return `<article>
    <header>
      <p>${journalLink(base, archive, 'All posts')}</p>
      <h1>${esc(post.title)}</h1>
      ${metadata(base, post)}
      <p class="lead">${esc(post.summary)}</p>
    </header>
    ${post.body.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}
  </article>`;
}

export function renderBlogDemo(base, appearance, page) {
  const content = page.view === 'archive' ? archiveView(base, page) :
    page.view === 'post' ? article(base, page.post) : home(base);
  return `<header id="journal-header" class="cluster">
    <a href="${href(base, journal)}"><img src="${asset(base, 'assets/brand.svg')}" width="32" height="32" alt=""> UIBMS Journal</a>
    ${navigation(base, 'journal-desktop', page)}
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
    ${navigation(base, 'journal-mobile', page)}
  </dialog>
  <main id="journal-main">${content}</main>
  <footer id="journal-footer"><a href="${href(base, 'demos')}">All demos</a> · <a href="${href(base, 'docs/drawer')}">Drawer reference</a></footer>`;
}
