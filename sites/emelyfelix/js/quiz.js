/* Natural Wellness Quiz: the card's lead magnet.
   5 quick questions -> name + WhatsApp -> a suggested routine from the products on this card.
   The lead is saved for the back office (Leads tab) before the result shows, and the visitor
   can send their result to Emely & Felix on WhatsApp in one tap.
   Deep link: add ?quiz=1 (or #quiz) to the card URL to open it straight away.
   Source tag: ?src=google-ads, ?src=flyer, ?utm_source=... is saved with the lead.
   Copy rule: no medical claims. Products "support" a routine; results vary. */
(function () {
  "use strict";
  var C = window.CB_CONFIG; if (!C || !window.cbRpc) return;
  var card = document.querySelector(".card"); if (!card) return;
  var root = document.getElementById("qz"); if (!root) return;

  /* goal -> products, built from the U-MUVO catalog (files/catalog-en.pdf). Edit here to change suggestions.
     Each product shows what's IN it (ingredients from the catalog), never what it cures. */
  var PICKS = {
    comfort:  ["Painless Night", "Dekamin", "Sornie Collagen Patch"],
    energy:   ["B12 Plus", "GlutaMore"],
    sleep:    ["Melatonin Plus"],
    skin:     ["Sornie Collagen Patch", "Sornie Anti-Aging Mask", "GlutaMore"],
    weight:   ["SlimStyle"],
    heart:    ["Omevia", "B12 Plus", "Dekamin"],
    intimacy: ["Ladies Night", "Gentlemen Night"],
    income:   []
  };
  /* product facts live in js/products.js (shared with the tappable product sheets) */
  var INFO = {}; Object.keys(window.UMUVO_PRODUCTS || {}).forEach(function (k) { INFO[k] = window.UMUVO_PRODUCTS[k].info; });

  var T = {
    en: {
      kicker: "Emely & Felix · U-MUVO", title: "Natural Wellness Quiz", close: "Close", back: "Back", next: "Next",
      step: function (a, b) { return "Question " + a + " of " + b; },
      qs: [
        { k: "goal", q: "What would you most like to feel better?", o: [
          ["comfort", "Body comfort (aches, tension)"], ["energy", "More energy during the day"], ["sleep", "Better, deeper sleep"],
          ["skin", "Skin and natural glow"], ["weight", "Weight and feeling lighter"], ["heart", "Heart health and healthy aging"],
          ["intimacy", "Intimacy and vitality"], ["income", "Earning extra income"]] },
        { k: "often", q: "How often is this on your mind?", o: [["daily", "Every day"], ["weekly", "A few times a week"], ["sometimes", "Now and then"]] },
        { k: "tried", q: "What have you tried so far?", o: [["nothing", "Nothing yet"], ["pills", "Pills from the store"], ["creams", "Creams or rubs"], ["supps", "Other supplements"]] },
        { k: "want", q: "What matters most to you?", o: [["natural", "Natural ingredients"], ["easy", "Easy to use"], ["price", "A good price"], ["guide", "Someone to guide me"]] },
        { k: "team", q: "Would you like to earn by sharing products you love?", o: [["yes", "Yes, tell me more"], ["maybe", "Maybe, I'm curious"], ["no", "No, just the products"]] }
      ],
      cTitle: "Where should we send your routine?", cSub: "Emely & Felix will send it to you personally. No spam.",
      fName: "Your name", fPhone: "WhatsApp or phone", fEmail: "Email (optional)",
      consent: "I agree that Emely & Felix may contact me by WhatsApp, text or email about my results. I can ask them to stop any time.",
      see: "See my routine", saving: "One moment...",
      eName: "Please add your name.", eContact: "Please add a phone number or email.", eConsent: "Please check the box so we can reach you.",
      eNet: "We couldn't save that. Check your connection and try again.",
      rKicker: "Your suggested routine", rFor: "For ", rNote: "People with the same goal often start with these. Emely & Felix will help you pick what fits you.",
      rIncome: "You're a great fit for our team. Emely & Felix will show you how the business works, step by step.",
      waBtn: "Send my results on WhatsApp", catBtn: "Open the catalog", joinBtn: "See the business opportunity",
      fine: "Natural wellness products. Not a medicine and not meant to diagnose or treat any condition. Results vary. Talk to your doctor if you have a health concern.",
      goals: { comfort: "body comfort", energy: "more energy", sleep: "better sleep", skin: "skin and glow", weight: "feeling lighter", heart: "heart health and healthy aging", intimacy: "intimacy and vitality", income: "extra income" },
      wa: function (n, g, p, t) {
        return "Hi Emely and Felix! I'm " + n + ". I just took the wellness quiz on your card. My goal: " + g + "." +
          (p.length ? " Suggested for me: " + p.join(", ") + "." : "") + (t === "yes" || t === "maybe" ? " I'm also interested in joining the team." : "") + " Can you help me get started?";
      }
    },
    es: {
      kicker: "Emely & Felix · U-MUVO", title: "Quiz de Bienestar Natural", close: "Cerrar", back: "Atrás", next: "Siguiente",
      step: function (a, b) { return "Pregunta " + a + " de " + b; },
      qs: [
        { k: "goal", q: "¿Qué te gustaría sentir mejor?", o: [
          ["comfort", "Comodidad del cuerpo (molestias, tensión)"], ["energy", "Más energía durante el día"], ["sleep", "Dormir mejor y más profundo"],
          ["skin", "Piel y brillo natural"], ["weight", "Peso y sentirme más ligero"], ["heart", "Corazón y envejecer saludable"],
          ["intimacy", "Intimidad y vitalidad"], ["income", "Ganar ingresos extra"]] },
        { k: "often", q: "¿Con qué frecuencia piensas en esto?", o: [["daily", "Todos los días"], ["weekly", "Varias veces por semana"], ["sometimes", "De vez en cuando"]] },
        { k: "tried", q: "¿Qué has probado hasta ahora?", o: [["nothing", "Nada todavía"], ["pills", "Pastillas de la tienda"], ["creams", "Cremas o ungüentos"], ["supps", "Otros suplementos"]] },
        { k: "want", q: "¿Qué es lo más importante para ti?", o: [["natural", "Ingredientes naturales"], ["easy", "Fácil de usar"], ["price", "Un buen precio"], ["guide", "Alguien que me guíe"]] },
        { k: "team", q: "¿Te gustaría ganar compartiendo productos que te encantan?", o: [["yes", "Sí, cuéntame más"], ["maybe", "Quizás, tengo curiosidad"], ["no", "No, solo los productos"]] }
      ],
      cTitle: "¿A dónde te enviamos tu rutina?", cSub: "Emely y Felix te la envían personalmente. Sin spam.",
      fName: "Tu nombre", fPhone: "WhatsApp o teléfono", fEmail: "Email (opcional)",
      consent: "Acepto que Emely y Felix me contacten por WhatsApp, texto o email sobre mis resultados. Puedo pedirles que paren cuando quiera.",
      see: "Ver mi rutina", saving: "Un momento...",
      eName: "Por favor escribe tu nombre.", eContact: "Por favor escribe un teléfono o email.", eConsent: "Marca la casilla para poder contactarte.",
      eNet: "No pudimos guardarlo. Revisa tu conexión e intenta otra vez.",
      rKicker: "Tu rutina sugerida", rFor: "Para ", rNote: "Las personas con tu misma meta suelen empezar con estos. Emely y Felix te ayudan a escoger lo que va contigo.",
      rIncome: "Eres perfecto para nuestro equipo. Emely y Felix te enseñan cómo funciona el negocio, paso a paso.",
      waBtn: "Enviar mis resultados por WhatsApp", catBtn: "Abrir el catálogo", joinBtn: "Ver la oportunidad de negocio",
      fine: "Productos naturales de bienestar. No son medicina y no son para diagnosticar ni tratar ninguna condición. Los resultados varían. Consulta a tu médico si tienes una preocupación de salud.",
      goals: { comfort: "comodidad del cuerpo", energy: "más energía", sleep: "dormir mejor", skin: "piel y brillo", weight: "sentirme más ligero", heart: "corazón y envejecer saludable", intimacy: "intimidad y vitalidad", income: "ingresos extra" },
      wa: function (n, g, p, t) {
        return "¡Hola Emely y Felix! Soy " + n + ". Acabo de hacer el quiz de bienestar en su tarjeta. Mi meta: " + g + "." +
          (p.length ? " Me sugirieron: " + p.join(", ") + "." : "") + (t === "yes" || t === "maybe" ? " También me interesa unirme al equipo." : "") + " ¿Me ayudan a empezar?";
      }
    }
  };

  var st = { i: 0, a: {}, es: false, lastBtn: null, saved: false, busy: false };
  var QN = T.en.qs.length;
  function L() { return T[st.es ? "es" : "en"]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function phone() { return document.body.dataset.phone || "13212038541"; }
  function source() {
    try {
      var q = new URLSearchParams(location.search);
      var s = q.get("src") || q.get("utm_source") || "";
      var c = q.get("utm_campaign"); if (s && c) s += "/" + c;
      if (!s && document.referrer) { try { var h = new URL(document.referrer).hostname.replace(/^www\./, ""); if (h && h !== location.hostname) s = h; } catch (e) {} }
      return (s || "card").slice(0, 80);
    } catch (e) { return "card"; }
  }
  var SRC = source();
  function picks() { return PICKS[st.a.goal] || []; }

  var sheet = root.querySelector(".qz-sheet"), body = root.querySelector(".qz-body"), foot = root.querySelector(".qz-foot");
  var bar = root.querySelector(".qz-bar i");

  function head() {
    var t = L();
    root.querySelector(".qz-kicker").textContent = t.kicker;
    root.querySelector("#qzTitle").textContent = t.title;
    root.querySelector(".qz-x").setAttribute("aria-label", t.close);
  }
  function progress(n) { bar.style.width = Math.round(n * 100) + "%"; }

  function paintQ() {
    var t = L(), q = t.qs[st.i], cur = st.a[q.k];
    progress(st.i / (QN + 1));
    body.innerHTML = '<p class="qz-step">' + esc(t.step(st.i + 1, QN)) + '</p><h3 class="qz-q" tabindex="-1">' + esc(q.q) + '</h3>' +
      '<div class="qz-opts" role="radiogroup" aria-label="' + esc(q.q) + '">' + q.o.map(function (o) {
        return '<button type="button" class="qz-opt" role="radio" aria-checked="' + (cur === o[0]) + '" data-v="' + o[0] + '">' + esc(o[1]) + "</button>";
      }).join("") + "</div>";
    foot.innerHTML = st.i ? '<button type="button" class="qz-ghost" data-qz="back">' + esc(t.back) + "</button>" : "";
    var h = body.querySelector(".qz-q"); if (h) h.focus();
  }

  function paintContact(msg) {
    var t = L(), prev = { n: val("qzName"), p: val("qzPhone"), e: val("qzEmail"), c: chk() };
    progress(QN / (QN + 1));
    body.innerHTML = '<h3 class="qz-q" tabindex="-1">' + esc(t.cTitle) + '</h3><p class="qz-sub">' + esc(t.cSub) + "</p>" +
      '<div class="qz-fields">' +
      '<label><span>' + esc(t.fName) + '</span><input id="qzName" type="text" autocomplete="given-name" maxlength="120" value="' + esc(prev.n) + '"></label>' +
      '<label><span>' + esc(t.fPhone) + '</span><input id="qzPhone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="' + esc(prev.p) + '"></label>' +
      '<label><span>' + esc(t.fEmail) + '</span><input id="qzEmail" type="email" inputmode="email" autocomplete="email" maxlength="200" value="' + esc(prev.e) + '"></label>' +
      '<label class="qz-consent"><input id="qzConsent" type="checkbox"' + (prev.c ? " checked" : "") + '><span>' + esc(t.consent) + "</span></label>" +
      '</div><p class="qz-err" role="alert">' + esc(msg || "") + "</p>";
    foot.innerHTML = '<button type="button" class="qz-ghost" data-qz="back">' + esc(t.back) + '</button>' +
      '<button type="button" class="qz-go" data-qz="submit">' + esc(st.busy ? t.saving : t.see) + "</button>";
    var h = body.querySelector(".qz-q"); if (h && !msg) h.focus();
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function chk() { var el = document.getElementById("qzConsent"); return !!(el && el.checked); }

  function paintResult() {
    var t = L(), p = picks(), g = st.a.goal, team = st.a.team === "yes" || st.a.team === "maybe" || g === "income";
    progress(1);
    var join = card.querySelector(".join-btn"), cat = card.querySelector(".cover");
    var wa = "https://wa.me/" + phone() + "?text=" + encodeURIComponent(t.wa(st.name || "", t.goals[g] || "", p, st.a.team));
    body.innerHTML = '<p class="qz-step">' + esc(t.rKicker) + '</p><h3 class="qz-q" tabindex="-1">' + esc(t.rFor + (t.goals[g] || "")) + "</h3>" +
      (p.length ? '<ul class="qz-picks">' + p.map(function (x) { var d = INFO[x]; return "<li><span><b>" + esc(x) + "</b>" + (d ? "<small>" + esc(d[st.es ? 1 : 0]) + "</small>" : "") + "</span></li>"; }).join("") + "</ul><p class=\"qz-sub\">" + esc(t.rNote) + "</p>" : "") +
      (team ? '<p class="qz-team">' + esc(t.rIncome) + "</p>" : "") +
      '<p class="qz-fine">' + esc(t.fine) + "</p>";
    foot.innerHTML = '<div class="qz-res">' +
      '<a class="qz-wa" href="' + esc(wa) + '" target="_blank" rel="noopener"><svg class="ico"><use href="#i-wa"/></svg>' + esc(t.waBtn) + "</a>" +
      (cat ? '<a class="qz-ghost" href="' + esc(cat.href) + '" target="_blank" rel="noopener">' + esc(t.catBtn) + "</a>" : "") +
      (team && join ? '<a class="qz-ghost" href="' + esc(join.href) + '" target="_blank" rel="noopener">' + esc(t.joinBtn) + "</a>" : "") +
      "</div>";
    var h = body.querySelector(".qz-q"); if (h) h.focus();
  }

  function submit() {
    if (st.busy) return;
    var t = L(), n = val("qzName"), ph = val("qzPhone"), em = val("qzEmail");
    if (!n) return paintContact(t.eName);
    if (ph.replace(/\D/g, "").length < 7 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return paintContact(t.eContact);
    if (!chk()) return paintContact(t.eConsent);
    st.name = n;
    if (st.saved) return paintResult();
    st.busy = true; paintContact();
    window.cbRpc("cb_lead_submit", {
      p_slug: C.slug, p_name: n, p_phone: ph || null, p_email: em || null, p_goal: st.a.goal || null,
      p_answers: { often: st.a.often || null, tried: st.a.tried || null, want: st.a.want || null, picks: picks() },
      p_team: st.a.team || null, p_source: SRC, p_lang: st.es ? "es" : "en", p_consent: true
    }).then(function (r) {
      st.busy = false;
      if (r && r.ok) { st.saved = true; track("quiz_lead"); paintResult(); }
      else paintContact(r && r.error === "contact" ? t.eContact : r && r.error === "name" ? t.eName : t.eNet);
    }).catch(function () { st.busy = false; paintContact(t.eNet); });
  }

  /* optional analytics hooks: fire if GA4 / Meta Pixel are added to the page later */
  function track(ev) { try { if (window.gtag) window.gtag("event", ev, { source: SRC }); if (window.fbq) window.fbq("track", "Lead"); } catch (e) {} }

  function open(btn) {
    st.lastBtn = btn || document.activeElement; st.es = card.dataset.lang === "es";
    if (st.saved) { head(); root.hidden = false; document.body.classList.add("bk-open"); paintResult(); return; }
    st.i = 0; st.a = {}; head();
    root.hidden = false; document.body.classList.add("bk-open");
    paintQ(); track("quiz_open");
  }
  function close() {
    root.hidden = true; document.body.classList.remove("bk-open");
    if (st.lastBtn && st.lastBtn.focus) st.lastBtn.focus();
  }

  root.addEventListener("click", function (e) {
    if (e.target === root) return close();
    if (e.target.closest(".qz-x")) return close();
    var o = e.target.closest(".qz-opt");
    if (o) {
      var q = T.en.qs[st.i]; st.a[q.k] = o.dataset.v;
      body.querySelectorAll(".qz-opt").forEach(function (b) { b.setAttribute("aria-checked", b === o ? "true" : "false"); });
      setTimeout(function () { st.i++; if (st.i < QN) paintQ(); else paintContact(); }, 180);
      return;
    }
    var a = e.target.closest("[data-qz]"); if (!a) return;
    if (a.dataset.qz === "back") { if (st.i >= QN) st.i = QN - 1; else st.i = Math.max(0, st.i - 1); paintQ(); }
    else if (a.dataset.qz === "submit") submit();
  });
  root.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox") { e.preventDefault(); submit(); return; }
    if (e.key === "Tab") {
      var f = [].slice.call(sheet.querySelectorAll("button,a[href],input")).filter(function (x) { return x.offsetParent; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  document.querySelectorAll("[data-quiz]").forEach(function (b) { b.addEventListener("click", function () { open(b); }); });
  try {
    var qp = new URLSearchParams(location.search);
    if (qp.get("quiz") === "1" || location.hash === "#quiz") {
      if (qp.get("lang") === "es" && card.dataset.lang !== "es") { var lb = card.querySelector("[data-lang]"); if (lb) lb.click(); }
      setTimeout(function () { open(null); }, 350);
    }
  } catch (e) {}
})();
