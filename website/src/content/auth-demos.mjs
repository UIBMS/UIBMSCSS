import {asset, href} from '../lib/config.mjs';

const email = '<label for="auth-email">Email address</label><input id="auth-email" type="email" autocomplete="email" required>';
const newPassword = '<label for="auth-new-password">New password</label><input id="auth-new-password" type="password" autocomplete="new-password" minlength="8" required aria-describedby="auth-password-hint"><small id="auth-password-hint">Use at least 8 characters for this demo.</small>';

const flows = [
  {
    route:'login', title:'Sign in', icon:'lock',
    intro:'Enter your email and password to try the sign-in flow.',
    fields:email+'<label for="auth-password">Password</label><input id="auth-password" type="password" autocomplete="current-password" required>',
    action:'Sign in', result:'Demo sign-in complete.',
    features:['Native email and password fields','Links to account creation and recovery']
  },
  {
    route:'signup', title:'Create an account', icon:'user',
    intro:'Try the account creation form using sample details.',
    fields:'<label for="auth-name">Full name</label><input id="auth-name" autocomplete="name" required>'+email+newPassword,
    action:'Create demo account', result:'Demo sign-up complete.',
    features:['Native form validation','Name, email and new password inputs']
  },
  {
    route:'reset-password', title:'Reset your password', icon:'mail',
    intro:'Enter a sample email address to try account recovery.',
    fields:email, action:'Continue', result:'Demo password reset complete. No email was sent.',
    features:['Simulated reset request','New password step']
  }
];

export const authDemos = flows.map(({route,title,intro,features}) => ({
  slug:'demos/'+route, title, description:intro, kind:'application', standalone:true,
  sections:[], documentation:'docs/form-validation', entry:'auth-demo',
  stylesheets:['icons/icons.css'], features
}));

export function renderAuthDemo(base, page) {
  const flow = flows.find(({route}) => page.slug === 'demos/'+route);
  const isReset = flow.route === 'reset-password';
  return `<header id="auth-header">
  <a href="${href(base,'demos')}"><img src="${asset(base,'assets/brand.svg')}" alt="" width="32" height="32"> UIBMS CSS</a>
  <a href="${href(base,'demos')}">All demos</a>
</header>
<main id="auth-main">
  <section aria-labelledby="auth-title">
    <header>
      <span data-icon="${flow.icon}" aria-hidden="true"></span>
      <h1 id="auth-title">${flow.title}</h1>
      <p>${flow.intro}</p>
    </header>
    <p id="auth-demo-note">Interactive demo. Use sample details. Entries are cleared on submission.</p>
    <noscript><p>Enable JavaScript to show the simulated result.</p></noscript>
    <form method="dialog" class="stack" aria-describedby="auth-demo-note">
      ${flow.fields}
      <button type="submit">${flow.action}</button>
    </form>
    ${isReset ? `<form method="dialog" class="stack" aria-labelledby="auth-reset-title" hidden>
      <h2 id="auth-reset-title" tabindex="-1">Choose a new password</h2>
      <p>This step simulates opening a reset link.</p>
      ${newPassword}
      <button type="submit">Reset demo password</button>
    </form>` : ''}
    <output id="auth-result" role="status" data-result="${flow.result}"></output>
    <footer>
      ${flow.route === 'login' ? `<a href="${href(base,'demos/reset-password')}">Forgot password?</a>
      <p>New here? <a href="${href(base,'demos/signup')}">Create an account</a></p>` :
      `<a href="${href(base,'demos/login')}">Back to sign in</a>`}
    </footer>
  </section>
</main>`;
}
