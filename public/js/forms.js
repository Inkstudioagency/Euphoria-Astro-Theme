/*
 * Form handler — replaces Webflow's hosted form backend.
 *
 * Every `.w-form form` posts its fields (FormData) to the endpoint set in
 * PUBLIC_FORM_ENDPOINT (Formspree, Web3Forms, Basin, your own API…), rendered
 * by BaseLayout as <meta name="form-endpoint">. The Webflow markup and its
 * states are kept: the form hides and `.w-form-done` shows on success,
 * `.w-form-fail` shows on error, and the submit button shows its
 * `data-wait` text while sending.
 *
 * Without an endpoint the form runs in demo mode: it shows the success state
 * without sending anything, so the live demo behaves like the original.
 */
(function () {
  var meta = document.querySelector('meta[name="form-endpoint"]');
  var endpoint = meta ? meta.getAttribute('content') : '';

  function show(el, visible) {
    if (el) el.style.display = visible ? 'block' : 'none';
  }

  // Capture phase: handle the submit before anything else does.
  document.addEventListener('submit', function (event) {
    var form = event.target;
    var wrapper = form && form.closest ? form.closest('.w-form') : null;
    if (!wrapper) return;
    event.preventDefault();
    event.stopPropagation();

    var done = wrapper.querySelector('.w-form-done');
    var fail = wrapper.querySelector('.w-form-fail');
    var submit = form.querySelector('[type="submit"]');
    var label = submit ? submit.value : '';
    show(fail, false);

    // Honeypot: bots fill hidden fields, people do not.
    var trap = form.querySelector('[name="_gotcha"]');
    if (trap && trap.value) return;

    function success() {
      form.reset();
      show(form, false);
      show(done, true);
    }
    function failure() {
      show(fail, true);
    }
    function reset() {
      if (submit) {
        submit.value = label;
        submit.disabled = false;
      }
    }

    if (!endpoint) {
      console.info('[forms] PUBLIC_FORM_ENDPOINT is not set — demo mode, nothing was sent.');
      success();
      return;
    }

    if (submit) {
      submit.value = submit.getAttribute('data-wait') || label;
      submit.disabled = true;
    }
    var data = new FormData(form);
    data.append('form-name', form.getAttribute('data-name') || form.name || 'Form');
    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        success();
      })
      .catch(failure)
      .finally(reset);
  }, true);
})();
