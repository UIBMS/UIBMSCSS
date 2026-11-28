const forms = [...document.querySelectorAll('#auth-main form')];
const result = document.querySelector('#auth-result');

for (const [index, form] of forms.entries()) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.reset();
    const nextForm = forms[index + 1];
    if (nextForm) {
      form.hidden = true;
      nextForm.hidden = false;
      nextForm.querySelector('h2').focus();
      return;
    }
    result.textContent = result.dataset.result;
    if (index > 0) {
      document.querySelector('#auth-main footer a').focus();
      form.hidden = true;
    }
  });
}
