/* Yalid Betancourt - Farmasi card (Peonia look) at uniqstyle.okunami.pro
   Farmasi Cover Girl system: Abril Fatface, coral palette, lipstick pills, stories. */
(function () {
  'use strict';

  var CLIENT = {
    name: 'Yalid Betancourt',
    first: 'Yalid',
    farmasiId: 'uniqstyle',
    phone: '18622988547',
    email: 'yalid04@gmail.com',
    ig: '', fb: '', tt: '',            // no socials yet; the row stays hidden until a handle is added
    url: 'https://uniqstyle.okunami.pro/'
  };
  var SHOP = 'https://www.farmasius.com/' + CLIENT.farmasiId;
  var JOIN = SHOP + '/package-selection';
  var ANGEL = '14079609004';

  var T = {
    en: {
      role: 'Farmasi Beauty Influencer', inside: 'In this issue',
      shopT: 'Shop My Farmasi Picks', shopS: 'Makeup, skincare and fragrance I actually use. Tap to shop.',
      joinT: 'Join My Beauty Team', joinS: 'Become a Farmasi influencer and build your own beauty business with me.',
      call: 'Call', text: 'Text', email: 'Email', save: 'Save Contact', share: 'Share my card',
      ref: 'Get your own vCard', refSms: 'or by text', qrT: 'Scan my card', qrS: 'Tap to open full screen',
      qrHint: 'Scan to save my card',
      copied: 'Link copied. Paste it anywhere.', copyFail: 'Copy this link: '
    },
    es: {
      role: 'Influencer de Belleza Farmasi', inside: 'En esta edición',
      shopT: 'Compra Mis Favoritos de Farmasi', shopS: 'Maquillaje, cuidado de la piel y fragancias que de verdad uso. Toca para comprar.',
      joinT: 'Únete a Mi Equipo de Belleza', joinS: 'Conviértete en influencer de Farmasi y crea tu propio negocio de belleza conmigo.',
      call: 'Llamar', text: 'Texto', email: 'Correo', save: 'Guardar Contacto', share: 'Compartir mi tarjeta',
      ref: 'Obtén tu propia vCard', refSms: 'o por texto', qrT: 'Escanea mi tarjeta', qrS: 'Toca para verla en grande',
      qrHint: 'Escanea para guardar mi tarjeta',
      copied: 'Enlace copiado. Pégalo donde quieras.', copyFail: 'Copia este enlace: '
    }
  };

  // Spanish by default; a visitor's own EN/ES choice is remembered on their phone
  var lang = 'es';
  try { lang = localStorage.getItem('farmasi-lang') || 'es'; } catch (e) {}
  if (!T[lang]) lang = 'es';

  function k(key) { return T[lang][key]; }
  function ico(id) { return '<svg aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var NAME = esc(CLIENT.name);

  function langToggle() {
    return '<div class="lang" role="group" aria-label="Language">' +
      '<button type="button" data-lang="en" aria-pressed="' + (lang === 'en') + '">EN</button>' +
      '<button type="button" data-lang="es" aria-pressed="' + (lang === 'es') + '">ES</button></div>';
  }
  function stories() {
    return '<p class="eyebrow">' + k('inside') + '</p>' +
      '<a class="story" href="' + SHOP + '" target="_blank" rel="noopener"><span class="num">01</span><span class="story-text">' +
      '<span class="story-title">' + k('shopT') + '</span><span class="story-sub">' + k('shopS') + '</span></span></a>' +
      '<a class="story" href="' + JOIN + '" target="_blank" rel="noopener"><span class="num">02</span><span class="story-text">' +
      '<span class="story-title">' + k('joinT') + '</span><span class="story-sub">' + k('joinS') + '</span></span></a>';
  }
  function pills() {
    return '<div class="actions">' +
      '<a class="pill coral save" href="contact.vcf?v=1" download="yalid-betancourt.vcf">' + ico('save') + '<span>' + k('save') + '</span></a>' +
      '<div class="pill-row">' +
      '<a class="pill ink" href="tel:+' + CLIENT.phone + '">' + ico('phone') + '<span>' + k('call') + '</span></a>' +
      '<a class="pill ink" href="sms:+' + CLIENT.phone + '">' + ico('sms') + '<span>' + k('text') + '</span></a>' +
      '<a class="pill ink" href="https://wa.me/' + CLIENT.phone + '" target="_blank" rel="noopener">' + ico('wa') + '<span>WhatsApp</span></a>' +
      '<a class="pill ink" href="mailto:' + CLIENT.email + '">' + ico('mail') + '<span>' + k('email') + '</span></a>' +
      '</div></div>';
  }
  function social() {
    var a = [];
    if (CLIENT.ig) a.push('<a href="https://instagram.com/' + CLIENT.ig + '" target="_blank" rel="noopener">Instagram</a>');
    if (CLIENT.fb) a.push('<a href="https://facebook.com/' + CLIENT.fb + '" target="_blank" rel="noopener">Facebook</a>');
    if (CLIENT.tt) a.push('<a href="https://tiktok.com/@' + CLIENT.tt + '" target="_blank" rel="noopener">TikTok</a>');
    return '<nav class="social" aria-label="Social"' + (a.length ? '' : ' hidden') + '>' + a.join('') + '</nav>';
  }
  function closing() {
    var m = encodeURIComponent('Hi Angel, I really like the vCard you made for ' + CLIENT.name + ', and I would like you to create one for me as well. Please contact me at your earliest convenience. Thank you!');
    return social() +
      '<button type="button" class="qr" data-qr><img src="images/qr.svg?v=1" alt="QR" width="80" height="80">' +
      '<span><b>' + k('qrT') + '</b><small>' + k('qrS') + '</small></span></button>' +
      '<button type="button" class="share" data-share>' + k('share') + '</button>' +
      '<p class="toast" data-toast role="status" aria-live="polite" hidden></p>' +
      '<div class="ref-wrap"><a class="referral" href="https://wa.me/' + ANGEL + '?text=' + m + '" target="_blank" rel="noopener">' + k('ref') + '</a>' +
      '<a class="ref-sms" href="sms:+' + ANGEL + '?&body=' + m + '">' + k('refSms') + '</a></div>' +
      '<a class="credit" href="https://finessemedia.pro" target="_blank" rel="noopener">Crafted by Finesse Media</a>';
  }
  function page() {
    return '<section class="pe-top"><div class="pe-lang">' + langToggle() + '</div>' +
      '<div class="pe-photo"><img class="cutout" src="images/cutout-tall.webp?v=1" alt="' + NAME + '"></div>' +
      '<h1 class="script">' + NAME + '</h1><p class="role">' + k('role') + '</p>' +
      '<svg class="curve" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="M0 24 C30 0 70 0 100 24 Z"/></svg></section>' +
      '<section class="inside"><img class="brand" src="images/farmasi-logo.png?v=1" alt="Farmasi">' + stories() + pills() + closing() + '</section>';
  }

  var card = document.getElementById('card');
  function render() {
    card.innerHTML = page();
    document.documentElement.lang = lang;
    document.getElementById('qrName').textContent = CLIENT.name;
    document.getElementById('qrHint').textContent = k('qrHint');
  }

  card.addEventListener('click', function (e) {
    var lb = e.target.closest('[data-lang]');
    if (lb) {
      lang = lb.getAttribute('data-lang');
      try { localStorage.setItem('farmasi-lang', lang); } catch (er) {}
      render();
      return;
    }
    if (e.target.closest('[data-qr]')) { qf.hidden = false; document.body.style.overflow = 'hidden'; return; }
    if (e.target.closest('[data-share]')) share();
  });

  /* full screen QR */
  var qf = document.getElementById('qrFull');
  function closeQr() { qf.hidden = true; document.body.style.overflow = ''; }
  document.getElementById('qrClose').addEventListener('click', closeQr);
  qf.addEventListener('click', function (e) { if (e.target === qf) closeQr(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQr(); });

  /* share with copy fallback */
  function say(msg) {
    var toast = card.querySelector('[data-toast]');
    if (!toast) return;
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(say.t); say.t = setTimeout(function () { toast.hidden = true; }, 4000);
  }
  function copy(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { say(k('copied')); }, function () { say(k('copyFail') + url); });
    } else { say(k('copyFail') + url); }
  }
  function share() {
    var data = { title: CLIENT.name, text: CLIENT.name + ' | Farmasi Beauty Influencer', url: CLIENT.url };
    if (navigator.share) {
      navigator.share(data).catch(function (err) { if (err && err.name === 'AbortError') return; copy(CLIENT.url); });
    } else { copy(CLIENT.url); }
  }

  /* soft tap sound (always on, no mute) */
  var ctx;
  function tick() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = 'sine';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.2);
    } catch (e) {}
  }
  document.addEventListener('pointerdown', function (e) { if (e.target.closest('a, button')) tick(); });

  render();
})();
