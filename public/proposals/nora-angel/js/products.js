/* Tappable products: tap a product on the card -> a sheet with its logo, what's in it,
   how it comes, what people choose it for, and "Order on WhatsApp" with the product named.
   All facts come from the U-MUVO catalog (files/catalog-en.pdf). No health claims:
   ingredients and format only. Shared with js/quiz.js (window.UMUVO_PRODUCTS).
   Works with the product list the owners edit in the back office: any name not listed
   here still opens a sheet with the order button. */
(function () {
  "use strict";
  var P = {
    "Sornie Collagen Patch": { img: "sornie-patch", kind: ["Transdermal patch", "Parche transdérmico"],
      info: ["Patch with collagen, hydrolyzed keratin, vitamin E and coenzyme Q10", "Parche con colágeno, queratina hidrolizada, vitamina E y coenzima Q10"],
      all: ["Collagen, hydrolyzed keratin, seaweed extract, vitamin E, acacia honey, coenzyme Q10", "Colágeno, queratina hidrolizada, extracto de algas, vitamina E, miel de acacia, coenzima Q10"] },
    "Sornie Anti-Aging Mask": { img: "sornie-mask", kind: ["Face mask, once a week", "Mascarilla facial, una vez por semana"],
      info: ["Weekly mask with collagen, hyaluronic acid and retinol A", "Mascarilla semanal con colágeno, ácido hialurónico y retinol A"],
      all: ["Collagen, aloe barbadensis, hyaluronic acid, ginseng, retinol A, lecithin, peptides, organic oils", "Colágeno, aloe barbadensis, ácido hialurónico, ginseng, retinol A, lecitina, péptidos, aceites orgánicos"] },
    "GlutaMore": { img: "glutamore", kind: ["Sublingual drops (under the tongue)", "Gotas sublinguales (debajo de la lengua)"],
      info: ["Sublingual glutathione drops with vitamin C, taurine and arginine", "Gotas sublinguales de glutatión con vitamina C, taurina y arginina"],
      all: ["L-glutathione, vitamin C, taurine, arginine, L-valine", "L-glutatión, vitamina C, taurina, arginina, L-valina"] },
    "Painless Night": { img: "painless-night", kind: ["Transdermal patch", "Parche transdérmico"],
      info: ["Transdermal patch with glucosamine and Korean red ginseng", "Parche transdérmico con glucosamina y ginseng rojo coreano"],
      all: ["Glucosamine, Korean red ginseng, silver ions, saponins, organic germanium", "Glucosamina, ginseng rojo coreano, iones de plata, saponinas, germanio orgánico"] },
    "SlimStyle": { img: "slimstyle", kind: null,
      info: ["Green tea, guarana, garcinia cambogia and L-carnitine", "Té verde, guaraná, garcinia cambogia y L-carnitina"],
      all: ["Spirulina, palmitoyl tripeptide, L-carnitine, organic ginger, green tea, guarana, garcinia cambogia", "Espirulina, palmitoil tripéptido, L-carnitina, jengibre orgánico, té verde, guaraná, garcinia cambogia"] },
    "Omevia": { img: "omevia", kind: null,
      info: ["Omega 3, coenzyme Q10, DHEA and pregnenolone", "Omega 3, coenzima Q10, DHEA y pregnenolona"],
      all: ["Omega 3, coenzyme Q10, DHEA, pregnenolone", "Omega 3, coenzima Q10, DHEA, pregnenolona"] },
    "B12 Plus": { img: "b12-plus", kind: null,
      info: ["Vitamins B12, B1, B3 and folic acid with vitamins C, D and E", "Vitaminas B12, B1, B3 y ácido fólico con vitaminas C, D y E"],
      all: ["Vitamin B3, vitamin B12, vitamin B1, folic acid, vitamin E, vitamin C, vitamin D", "Vitamina B3, vitamina B12, vitamina B1, ácido fólico, vitamina E, vitamina C, vitamina D"] },
    "Dekamin": { img: "dekamin", kind: ["Transdermal patch", "Parche transdérmico"],
      info: ["Transdermal patch with vitamins D3, K2 and C plus magnesium", "Parche transdérmico con vitaminas D3, K2 y C, y magnesio"],
      all: ["Vitamin D3, vitamin K2, vitamin C, magnesium", "Vitamina D3, vitamina K2, vitamina C, magnesio"] },
    "Melatonin Plus": { img: "melatonin-plus", kind: null,
      info: ["4.4 mg melatonin with lavender and rose essential oils", "4.4 mg de melatonina con aceites esenciales de lavanda y rosa"],
      all: ["4.4 mg melatonin, lavender essential oil, rose essential oil", "4.4 mg de melatonina, aceite esencial de lavanda, aceite esencial de rosa"] },
    "Ladies Night": { img: "ladies-night", kind: null,
      info: ["For her: ginseng, L-arginine, zinc, ginger and red clover", "Para ella: ginseng, L-arginina, zinc, jengibre y trébol rojo"],
      all: ["Omega 3, L-arginine, zinc, ginger, ginseng, dioscorea bulbifera, red clover", "Omega 3, L-arginina, zinc, jengibre, ginseng, dioscorea bulbifera, trébol rojo"] },
    "Gentlemen Night": { img: "gentlemen-night", kind: ["Transdermal patch, for him", "Parche transdérmico, para él"],
      info: ["For him: ginseng, maca, L-arginine, zinc and eurycoma longifolia", "Para él: ginseng, maca, L-arginina, zinc y eurycoma longifolia"],
      all: ["Omega 3, L-arginine, zinc, ginger, ginseng, maca, eurycoma longifolia", "Omega 3, L-arginina, zinc, jengibre, ginseng, maca, eurycoma longifolia"] }
  };
  /* what people choose it for (same goals as the quiz) */
  var FOR = {
    "Sornie Collagen Patch": ["skin", "comfort"], "Sornie Anti-Aging Mask": ["skin"], "GlutaMore": ["skin", "energy"],
    "Painless Night": ["comfort"], "SlimStyle": ["weight"], "Omevia": ["heart"], "B12 Plus": ["energy", "heart"],
    "Dekamin": ["comfort", "heart"], "Melatonin Plus": ["sleep"], "Ladies Night": ["intimacy"], "Gentlemen Night": ["intimacy"]
  };
  window.UMUVO_PRODUCTS = P;

  var card = document.querySelector(".card"), list = card && card.querySelector(".products"), root = document.getElementById("pd");
  if (!card || !list || !root) return;

  var T = {
    en: { kicker: "Nora & Angel · U-MUVO", close: "Close", inside: "What's in it", how: "How it comes", chosen: "People choose it for",
      order: "Order on WhatsApp", ask: "Ask us a question", cat: "See it in the catalog", hint: "Tap a product to see what's in it and order",
      fine: "Natural wellness product. Not a medicine and not meant to diagnose or treat any condition. Results vary.",
      goals: { comfort: "Body comfort", energy: "Energy", sleep: "Rest and sleep", skin: "Skin and glow", weight: "Feeling lighter", heart: "Heart and healthy aging", intimacy: "Intimacy and vitality" },
      orderMsg: function (n) { return "Hi Nora and Angel, I'd like to order " + n + ". Can you help me?"; },
      askMsg: function (n) { return "Hi Nora and Angel, I have a question about " + n + "."; } },
    es: { kicker: "Nora & Angel · U-MUVO", close: "Cerrar", inside: "Qué contiene", how: "Cómo viene", chosen: "Lo escogen para",
      order: "Ordenar por WhatsApp", ask: "Haznos una pregunta", cat: "Verlo en el catálogo", hint: "Toca un producto para ver qué contiene y ordenarlo",
      fine: "Producto natural de bienestar. No es medicina y no es para diagnosticar ni tratar ninguna condición. Los resultados varían.",
      goals: { comfort: "Comodidad del cuerpo", energy: "Energía", sleep: "Descanso y sueño", skin: "Piel y brillo", weight: "Sentirse más ligero", heart: "Corazón y envejecer saludable", intimacy: "Intimidad y vitalidad" },
      orderMsg: function (n) { return "Hola Nora y Angel, me gustaría pedir " + n + ". ¿Me ayudan?"; },
      askMsg: function (n) { return "Hola Nora y Angel, tengo una pregunta sobre " + n + "."; } }
  };
  function es() { return card.dataset.lang === "es"; }
  function L() { return T[es() ? "es" : "en"]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function phone() { return document.body.dataset.phone || "14077310427"; }
  function wa(msg) { return "https://wa.me/" + phone() + "?text=" + encodeURIComponent(msg); }

  /* make every product in the list a real button (also after back-office edits re-render it) */
  function wire() {
    [].forEach.call(list.querySelectorAll("li"), function (li) {
      if (li.querySelector("button")) return;
      var name = li.textContent.trim(); if (!name) return;
      li.textContent = "";
      var b = document.createElement("button"); b.type = "button"; b.className = "pd-chip"; b.dataset.p = name;
      b.setAttribute("aria-haspopup", "dialog"); b.textContent = name;
      li.appendChild(b);
    });
  }
  var hint = document.createElement("p"); hint.className = "pd-hint";
  list.parentNode.insertBefore(hint, list);
  function paintHint() { hint.textContent = L().hint; }
  wire(); paintHint();
  new MutationObserver(function () { wire(); }).observe(list, { childList: true });
  new MutationObserver(paintHint).observe(card, { attributes: true, attributeFilter: ["data-lang"] });

  var sheet = root.querySelector(".pd-sheet"), body = root.querySelector(".pd-body"), foot = root.querySelector(".pd-foot"), last = null;
  function open(name, btn) {
    var t = L(), p = P[name], i = es() ? 1 : 0, goals = FOR[name] || [];
    last = btn || null;
    root.querySelector(".pd-kicker").textContent = t.kicker;
    root.querySelector("#pdTitle").textContent = name;
    root.querySelector(".pd-x").setAttribute("aria-label", t.close);
    body.innerHTML =
      (p && p.img ? '<div class="pd-logo"><img src="images/products/' + p.img + '.jpg" alt="' + esc(name) + ' logo"></div>' : "") +
      (p && p.kind ? '<p class="pd-sec">' + esc(t.how) + '</p><p class="pd-txt">' + esc(p.kind[i]) + "</p>" : "") +
      (p ? '<p class="pd-sec">' + esc(t.inside) + '</p><p class="pd-txt">' + esc(p.all[i]) + "</p>" : "") +
      (goals.length ? '<p class="pd-sec">' + esc(t.chosen) + '</p><ul class="pd-tags">' + goals.map(function (g) { return "<li>" + esc(t.goals[g]) + "</li>"; }).join("") + "</ul>" : "") +
      '<p class="pd-fine">' + esc(t.fine) + "</p>";
    var cat = card.querySelector(".cover");
    foot.innerHTML = '<a class="pd-wa" href="' + esc(wa(t.orderMsg(name))) + '" target="_blank" rel="noopener"><svg class="ico"><use href="#i-wa"/></svg>' + esc(t.order) + "</a>" +
      '<div class="pd-two"><a class="pd-ghost" href="' + esc(wa(t.askMsg(name))) + '" target="_blank" rel="noopener">' + esc(t.ask) + "</a>" +
      (cat ? '<a class="pd-ghost" href="' + esc(cat.href) + '" target="_blank" rel="noopener">' + esc(t.cat) + "</a>" : "") + "</div>";
    root.hidden = false; document.body.classList.add("bk-open");
    body.scrollTop = 0;
    root.querySelector(".pd-x").focus();
    try { if (window.gtag) window.gtag("event", "product_view", { item_name: name }); } catch (e) {}
  }
  function close() { root.hidden = true; document.body.classList.remove("bk-open"); if (last && last.focus) last.focus(); }

  list.addEventListener("click", function (e) { var b = e.target.closest(".pd-chip"); if (b) open(b.dataset.p, b); });
  root.addEventListener("click", function (e) { if (e.target === root || e.target.closest(".pd-x")) close(); });
  root.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "Tab") {
      var f = [].slice.call(sheet.querySelectorAll("button,a[href]")).filter(function (x) { return x.offsetParent; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
})();
