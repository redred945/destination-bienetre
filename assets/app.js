(function () {
  // smooth page-to-page transitions — fade content out on leave, in on arrive
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      if (a.protocol !== 'http:' && a.protocol !== 'https:') return;
      if (a.origin !== location.origin) return;
      if (a.pathname === location.pathname && a.search === location.search && a.hash) return;
      if (a.href === location.href) return;
      e.preventDefault();
      var url = a.href;
      document.documentElement.classList.add('is-leaving');
      setTimeout(function () { window.location.href = url; }, 210);
    });
    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) document.documentElement.classList.remove('is-leaving');
    });
  }

  // contact form — posts to Web3Forms once a key is set, otherwise opens the mail app
  var cform = document.getElementById('cform');
  if (cform) {
    var cstatus = document.getElementById('cformStatus');
    var val = function (name) { var el = cform.elements[name]; return el ? String(el.value || '').trim() : ''; };
    var mailtoFallback = function () {
      var body = 'Nom : ' + val('nom') +
        '\nTéléphone : ' + val('telephone') +
        '\nE-mail : ' + val('email') +
        '\nPrestation souhaitée : ' + val('prestation') +
        '\n\n' + val('message');
      window.location.href = 'mailto:contact@destination-bien-etre.fr?subject=' +
        encodeURIComponent('Demande de contact — site web') +
        '&body=' + encodeURIComponent(body);
    };
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof cform.reportValidity === 'function' && !cform.reportValidity()) return;
      var key = val('access_key');
      if (!key || key.indexOf('VOTRE_CLE') !== -1) { mailtoFallback(); return; }
      if (cstatus) { cstatus.className = 'cform__status'; cstatus.textContent = 'Envoi en cours…'; }
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(cform)
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d || !d.success) throw new Error('fail');
        cform.reset();
        if (cstatus) { cstatus.className = 'cform__status is-ok'; cstatus.textContent = 'Merci, votre message est bien parti. Nous vous recontactons très vite.'; }
      }).catch(function () {
        if (cstatus) { cstatus.className = 'cform__status is-err'; cstatus.textContent = 'L’envoi automatique a échoué — on ouvre votre messagerie pour envoyer le message.'; }
        setTimeout(mailtoFallback, 1200);
      });
    });
  }

  var bar = document.querySelector('header.bar');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('is-float', window.scrollY > 60); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var b = document.getElementById('burger'), n = document.getElementById('nav');
  if (b && n) {
    var setMenuOpen = function (open) {
      n.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    };
    b.addEventListener('click', function () {
      var open = !n.classList.contains('is-open');
      setMenuOpen(open);
      if (open) {
        var firstLink = n.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
    n.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { setMenuOpen(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && n.classList.contains('is-open')) {
        setMenuOpen(false);
        b.focus();
      }
    });
  }

  // hide the floating call button while the footer or the contact form is in view,
  // so it never sits on top of the footer links or the form fields/submit button
  var fab = document.querySelector('.call-fab');
  var fabHideTargets = Array.prototype.slice.call(document.querySelectorAll('footer, #formulaire'));
  if (fab && fabHideTargets.length && 'IntersectionObserver' in window) {
    var fabIntersecting = new Set();
    var fabIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { fabIntersecting.add(en.target); } else { fabIntersecting.delete(en.target); }
      });
      fab.classList.toggle('is-hidden', fabIntersecting.size > 0);
    }, { rootMargin: '0px', threshold: 0 });
    fabHideTargets.forEach(function (t) { fabIo.observe(t); });
  }

  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var showAll = function () { items.forEach(function (el) { el.classList.add('in'); }); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window) || !items.length) { showAll(); return; }

  document.documentElement.classList.add('reveal-on');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  items.forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) { el.classList.add('in'); }
    else { io.observe(el); }
  });
  window.addEventListener('load', function () { setTimeout(showAll, 1400); });
})();
