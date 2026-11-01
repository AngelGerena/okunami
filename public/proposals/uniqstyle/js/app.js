/* OKUNAMI design picker - UniqStyle (Farmasi Cover Girl system: Abril Fatface, coral, lipstick pills, ring badge, stories)
   Swap CLIENT once her real details are in; every look reads from here. */
(function () {
  'use strict';

  var CLIENT = {
    name: 'UniqStyle',                 // TODO: her real full name
    first: 'UniqStyle',
    farmasiId: 'uniqstyle',
    phone: '14070000000',              // TODO: her cell with country code, digits only
    email: 'hola@uniqstyle.com',       // TODO: her email
    ig: '', fb: '', tt: ''             // TODO: handles; socials stay hidden until filled
  };
  var SHOP = 'https://www.farmasius.com/' + CLIENT.farmasiId;
  var JOIN = SHOP + '/package-selection';
  var ANGEL = '14079609004';

  var T = {
    en: {
      issue: 'The Beauty Issue', s1: 'Now', s2: 'Hiring', s3: 'beauty bosses',
      b1: 'BEAU', b2: 'TY.', st1: 'Shop & Glow!', st3: 'Join the team',
      ring: 'TAP ME • JOIN MY TEAM • TAP ME • JOIN MY TEAM •',
      role: 'Farmasi Beauty Influencer', inside: 'In this issue',
      shopT: 'Shop My Farmasi Picks', shopS: 'Makeup, skincare and fragrance I actually use. Tap to shop.',
      joinT: 'Join My Beauty Team', joinS: 'Become a Farmasi influencer and build your own beauty business with me.',
      call: 'Call', text: 'Text', email: 'Email', save: 'Save Contact', share: 'Share my card',
      ref: 'Get your own vCard', refSms: 'or by text', qrT: 'Scan my card', qrS: 'Tap to open full screen',
      copied: 'Link copied. Paste it anywhere.', copyFail: 'Copy this link: ',
      note: 'I help you find the products you will love and start your own beauty business with Farmasi.',
      glowLine: 'Your daily dose of glow', silkLine: 'beauty with purpose', shopHere: 'Shop here', joinMe: 'Join me',
      makeup: 'Makeup', skin: 'Skincare', well: 'Wellness', frag: 'Fragrance'
    },
    es: {
      issue: 'Edición Belleza', s1: 'Únete', s2: 'Ahora', s3: 'a mi equipo',
      b1: 'BELLE', b2: 'ZA.', st1: '¡Compra y Brilla!', st3: 'Únete al equipo',
      ring: 'TÓCAME • ÚNETE A MI EQUIPO • TÓCAME •',
      role: 'Influencer de Belleza Farmasi', inside: 'En esta edición',
      shopT: 'Compra Mis Favoritos de Farmasi', shopS: 'Maquillaje, cuidado de la piel y fragancias que de verdad uso. Toca para comprar.',
      joinT: 'Únete a Mi Equipo de Belleza', joinS: 'Conviértete en influencer de Farmasi y crea tu propio negocio de belleza conmigo.',
      call: 'Llamar', text: 'Texto', email: 'Correo', save: 'Guardar Contacto', share: 'Compartir mi tarjeta',
      ref: 'Obtén tu propia vCard', refSms: 'o por texto', qrT: 'Escanea mi tarjeta', qrS: 'Toca para verla en grande',
      copied: 'Enlace copiado. Pégalo donde quieras.', copyFail: 'Copia este enlace: ',
      note: 'Te ayudo a encontrar los productos que vas a amar y a empezar tu propio negocio de belleza con Farmasi.',
      glowLine: 'Tu dosis diaria de glow', silkLine: 'belleza con propósito', shopHere: 'Compra aquí', joinMe: 'Únete',
      makeup: 'Maquillaje', skin: 'Skincare', well: 'Bienestar', frag: 'Fragancias'
    }
  };

  var LOOKS = [
    { id: 'portada',   es: 'Portada',     en: 'Cover Girl' },
    { id: 'rosa',      es: 'Rosa Glass',  en: 'Rose Glass' },
    { id: 'editorial', es: 'Editorial',   en: 'Editorial' },
    { id: 'peonia',    es: 'Peonía',      en: 'Peony' },
    { id: 'atelier',   es: 'Atelier',     en: 'Atelier' },
    { id: 'glow',      es: 'Glow Studio', en: 'Glow Studio' },
    { id: 'labial',    es: 'Labial',      en: 'Lipstick' }
  ];

  var lang = 'es';
  try { lang = localStorage.getItem('farmasi-lang') || 'es'; } catch (e) {}
  if (!T[lang]) lang = 'es';
  var current = 'portada';

  function k(key) { return T[lang][key]; }
  function ico(id) { return '<svg aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var NAME = esc(CLIENT.name);

  /* ---------- shared Cover Girl pieces ---------- */
  function langToggle() {
    return '<div class="lang" role="group" aria-label="Language">' +
      '<button type="button" data-lang="en" aria-pressed="' + (lang === 'en') + '">EN</button>' +
      '<button type="button" data-lang="es" aria-pressed="' + (lang === 'es') + '">ES</button></div>';
  }
  function outline() {
    return '<div class="outline" aria-hidden="true"><span>' + k('b1') + '</span><span>' + k('b2') + '</span></div>';
  }
  function sticker(cls) {
    return '<a class="sticker ' + (cls || '') + '" href="' + JOIN + '" target="_blank" rel="noopener">' +
      '<svg class="ring" viewBox="0 0 140 140" aria-hidden="true"><defs><path id="ringPath-' + current + '" d="M70,70 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0"/></defs>' +
      '<text><textPath href="#ringPath-' + current + '" textLength="362" lengthAdjust="spacing">' + k('ring') + '</textPath></text></svg>' +
      '<span class="s1">' + k('s1') + '</span><span class="s2">' + k('s2') + '</span><span class="s3">' + k('s3') + '</span></a>';
  }
  function strip() {
    return '<nav class="strip" aria-label="Quick links">' +
      '<a href="' + SHOP + '" target="_blank" rel="noopener">' + k('st1') + '</a><span class="sl" aria-hidden="true">/</span>' +
      '<a href="' + JOIN + '" target="_blank" rel="noopener">' + k('st3') + '</a></nav>';
  }
  function nameBlock(cls) {
    return '<div class="cover-name ' + (cls || '') + '"><h1>' + NAME + '</h1><p class="role">' + k('role') + '</p></div>';
  }
  function stories() {
    return '<p class="eyebrow">' + k('inside') + '</p>' +
      '<a class="story" href="' + SHOP + '" target="_blank" rel="noopener"><span class="num">01</span><span class="story-text">' +
      '<span class="story-title">' + k('shopT') + '</span><span class="story-sub">' + k('shopS') + '</span></span></a>' +
      '<a class="story" href="' + JOIN + '" target="_blank" rel="noopener"><span class="num">02</span><span class="story-text">' +
      '<span class="story-title">' + k('joinT') + '</span><span class="story-sub">' + k('joinS') + '</span></span></a>';
  }
  function pills() {
    var wa = 'https://wa.me/' + CLIENT.phone;
    return '<div class="actions">' +
      '<a class="pill coral save" href="contact.vcf" download="' + CLIENT.farmasiId + '.vcf">' + ico('save') + '<span>' + k('save') + '</span></a>' +
      '<div class="pill-row">' +
      '<a class="pill ink" href="tel:+' + CLIENT.phone + '">' + ico('phone') + '<span>' + k('call') + '</span></a>' +
      '<a class="pill ink" href="sms:+' + CLIENT.phone + '">' + ico('sms') + '<span>' + k('text') + '</span></a>' +
      '<a class="pill ink" href="' + wa + '" target="_blank" rel="noopener">' + ico('wa') + '<span>WhatsApp</span></a>' +
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
    var refMsg = 'Hi Angel, I really like the vCard you made for ' + CLIENT.name + ', and I would like you to create one for me as well. Please contact me at your earliest convenience. Thank you!';
    var m = encodeURIComponent(refMsg);
    return social() +
      '<button type="button" class="qr" data-qr><img src="images/qr.svg" alt="QR" width="80" height="80">' +
      '<span><b>' + k('qrT') + '</b><small>' + k('qrS') + '</small></span></button>' +
      '<button type="button" class="share" data-share>' + k('share') + '</button>' +
      '<p class="toast" data-toast role="status" aria-live="polite" hidden></p>' +
      '<div class="ref-wrap"><a class="referral" href="https://wa.me/' + ANGEL + '?text=' + m + '" target="_blank" rel="noopener">' + k('ref') + '</a>' +
      '<a class="ref-sms" href="sms:+' + ANGEL + '?&body=' + m + '">' + k('refSms') + '</a></div>' +
      '<a class="credit" href="https://finessemedia.pro" target="_blank" rel="noopener">Crafted by Finesse Media</a>';
  }
  function inside(cls) {
    return '<section class="inside ' + (cls || '') + '"><img class="brand" src="images/farmasi-logo.png" alt="Farmasi">' +
      stories() + pills() + closing() + '</section>';
  }
  /* her cutout on a soft studio backdrop; bg + cutout share one crop so they line up */
  function cut(cls) { return '<img class="cutout ' + (cls || '') + '" src="images/cutout-tall.webp" alt="' + NAME + '">'; }

  /* ---------- seven looks ---------- */
  var TPL = {
    portada: function () {
      return '<header class="cover tall">' + outline() + cut() +
        '<div class="cover-top"><span class="issue">' + k('issue') + '</span>' + langToggle() + '</div>' +
        sticker() + strip() + '</header>' + nameBlock() + inside();
    },
    rosa: function () {
      return '<section class="rs-top"><div class="rs-lang">' + langToggle() + '</div>' +
        '<div class="popout"><div class="pop-tile">' + cut() + '</div></div>' +
        nameBlock('tight') + '</section>' + inside('glassy');
    },
    editorial: function () {
      return '<header class="ed-hero">' + cut() +
        '<div class="cover-top"><span class="issue">' + k('issue') + '</span>' + langToggle() + '</div>' +
        '<svg class="slant" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 L100 0 L100 20 Z"/></svg></header>' +
        '<div class="ed-name"><p class="kicker">Farmasi</p><h1>' + NAME + '</h1><p class="role">' + k('role') + '</p></div>' + inside('ruled');
    },
    peonia: function () {
      return '<section class="pe-top"><div class="pe-lang">' + langToggle() + '</div>' +
        '<div class="pe-photo">' + cut() + '</div>' +
        '<h1 class="script">' + esc(CLIENT.first) + '</h1><p class="role">' + k('role') + '</p>' +
        '<svg class="curve" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="M0 24 C30 0 70 0 100 24 Z"/></svg></section>' +
        inside();
    },
    atelier: function () {
      return '<section class="at-top"><div class="at-bar"><span class="issue">' + k('issue') + '</span>' + langToggle() + '</div>' +
        '<div class="frame"><div class="frame-in">' + cut() + '</div>' + sticker('small') + '</div>' +
        '<div class="tag"><h1>' + NAME + '</h1><p class="role">' + k('role') + '</p></div>' +
        '<p class="note">' + k('note') + '</p></section>' + inside();
    },
    glow: function () {
      return '<header class="gl-top"><div class="halo" aria-hidden="true"></div>' + outline() + cut() +
        '<div class="cover-top"><span class="issue">' + k('issue') + '</span>' + langToggle() + '</div>' + sticker() + '</header>' +
        '<section class="gl-panel">' + nameBlock('tight') +
        '<div class="chipset"><span>' + k('makeup') + '</span><span>' + k('skin') + '</span><span>' + k('well') + '</span><span>' + k('frag') + '</span></div>' +
        '</section>' + inside();
    },
    labial: function () {
      return '<header class="lb-top"><div class="lb-band" aria-hidden="true"></div>' +
        '<div class="lb-vert" aria-hidden="true">' + NAME.toUpperCase() + '</div>' +
        '<div class="lb-lang">' + langToggle() + '</div>' +
        '<div class="lb-photo">' + cut() + '</div>' + sticker('small lb-stick') + '</header>' +
        '<div class="lb-id"><h1>' + NAME + '</h1><p class="role">' + k('role') + '</p></div>' + inside();
    }
  };

  /* ---------- picker ---------- */
  var chips = document.getElementById('chips');
  var card = document.getElementById('card');

  function lookName(id) { for (var i = 0; i < LOOKS.length; i++) if (LOOKS[i].id === id) return lang === 'es' ? LOOKS[i].es : LOOKS[i].en; return id; }

  function render() {
    card.className = 'card look-' + current;
    card.innerHTML = TPL[current]();
    chips.innerHTML = LOOKS.map(function (l, i) {
      return '<button type="button" class="chip' + (l.id === current ? ' on' : '') + '" data-look="' + l.id + '" aria-pressed="' + (l.id === current) + '">' +
        '<span class="n">' + (i + 1) + '</span>' + (lang === 'es' ? l.es : l.en) + '</button>';
    }).join('');
    var on = chips.querySelector('.chip.on');
    if (on) chips.scrollLeft = on.offsetLeft - chips.clientWidth / 2 + on.clientWidth / 2;
    var msg = encodeURIComponent(lang === 'es'
      ? 'Hola Angel, soy ' + CLIENT.name + '. Quiero el diseño "' + lookName(current) + '" para mi tarjeta Farmasi.'
      : 'Hi Angel, this is ' + CLIENT.name + '. I want the "' + lookName(current) + '" design for my Farmasi card.');
    document.getElementById('pickWa').href = 'https://wa.me/' + ANGEL + '?text=' + msg;
    document.getElementById('pickSms').href = 'sms:+' + ANGEL + '?&body=' + msg;
    document.querySelectorAll('[data-es]').forEach(function (el) { el.textContent = el.getAttribute('data-' + lang); });
    document.documentElement.lang = lang;
  }

  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    current = b.getAttribute('data-look');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

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
    var url = location.href.split('#')[0];
    var data = { title: CLIENT.name, text: CLIENT.name + ' | Farmasi Beauty Influencer', url: url };
    if (navigator.share) {
      navigator.share(data).catch(function (err) { if (err && err.name === 'AbortError') return; copy(url); });
    } else { copy(url); }
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

  var hash = (location.hash || '').replace('#', '');
  if (TPL[hash]) current = hash;
  render();
})();
