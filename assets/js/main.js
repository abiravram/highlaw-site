// Abir Avram Law Office — shared site script
// 1) Mobile nav toggle
// 2) Contact form submission via Web3Forms (static, no backend needed)

(function () {
  var growDuration = 1700; // must match the CSS "preloader-grow" animation-duration
  var start = Date.now();
  var done = false;

  var morphAndHide = function () {
    if (done) return;
    done = true;
    var wrap = document.getElementById('preloader');
    var logo = wrap ? wrap.querySelector('img') : null;
    var target = document.querySelector('.brand img');

    if (!wrap) return;
    if (!logo || !target) { wrap.classList.add('is-hidden'); return; }

    // Freeze the logo exactly where the grow animation left it, without a visual jump.
    var current = logo.getBoundingClientRect();
    logo.style.animation = 'none';
    logo.style.transform = 'translate(0,0) scale(' + (current.width / logo.offsetWidth) + ') rotate(0deg)';
    // eslint-disable-next-line no-unused-expressions
    logo.offsetHeight; // force reflow so the frozen transform applies before we transition from it

    var goal = target.getBoundingClientRect();
    var dx = (goal.left + goal.width / 2) - (current.left + current.width / 2);
    var dy = (goal.top + goal.height / 2) - (current.top + current.height / 2);
    var scaleRatio = goal.width / current.width;

    logo.style.transition = 'transform .7s cubic-bezier(.4,0,.2,1)';
    logo.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (scaleRatio * (current.width / logo.offsetWidth)) + ')';

    setTimeout(function () { wrap.style.transition = 'opacity .45s ease'; wrap.classList.add('is-hidden'); }, 420);
  };

  var trigger = function () {
    var wait = Math.max(0, growDuration - (Date.now() - start));
    setTimeout(morphAndHide, wait);
  };
  window.addEventListener('load', trigger);
  setTimeout(trigger, 4000); // safety fallback so the site never stays stuck behind it
})();

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
