// Abir Avram Law Office — shared site script
// 1) Mobile nav toggle
// 2) Contact form submission via Web3Forms (static, no backend needed)

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;

      status.className = 'form-status';
      status.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = form.dataset.sending || 'Sending…';

      var accessKey = form.dataset.web3formsKey || '';

      try {
        if (!accessKey || accessKey.indexOf('YOUR_') === 0) {
          throw new Error('missing-key');
        }
        var data = new FormData(form);
        data.append('access_key', accessKey);

        var res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });
        var json = await res.json();

        if (json.success) {
          status.className = 'form-status success';
          status.textContent = form.dataset.successMsg || 'Thanks! Your message has been sent.';
          form.reset();
        } else {
          throw new Error(json.message || 'send-failed');
        }
      } catch (err) {
        status.className = 'form-status error';
        if (err.message === 'missing-key') {
          status.textContent = form.dataset.setupMsg ||
            'Form not fully configured yet: add a free Web3Forms access key (see README).';
        } else {
          status.textContent = form.dataset.errorMsg || 'Something went wrong. Please try again or contact us by phone/WhatsApp.';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
});
