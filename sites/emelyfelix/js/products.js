/* Tappable products: tap a product on the card -> a sheet with its logo, what's in it,
   how it comes, what people choose it for, and "Order on WhatsApp" with the product named.
   All facts come from the U-MUVO catalog (files/catalog-en.pdf). "What it's for" and the
   ingredient notes live in js/product-details.js and stay in "supports" language. Shared with js/quiz.js (window.UMUVO_PRODUCTS).
   Works with the product list the owners edit in the back office: any name not listed
   here still opens a sheet with the order button. */
(function () {
  "use strict";
  var P = {
    "Sornie Collagen Patch": { photo: "sornie-patch", img: "sornie-patch", kind: ["Transdermal patch", "Parche transdérmico"],
      info: ["Patch with collagen, hydrolyzed keratin, vitamin E and coenzyme Q10", "Parche con colágeno, queratina hidrolizada, vitamina E y coenzima Q10"],
      all: ["Collagen, hydrolyzed keratin, seaweed extract, vitamin E, acacia honey, coenzyme Q10", "Colágeno, queratina hidrolizada, extracto de algas, vitamina E, miel de acacia, coenzima Q10"] },
    "Sornie Anti-Aging Mask": { photo: "sornie-mask", img: "sornie-mask", kind: ["Face mask, once a week", "Mascarilla facial, una vez por semana"],
      info: ["Weekly mask with collagen, hyaluronic acid and retinol A", "Mascarilla semanal con colágeno, ácido hialurónico y retinol A"],
      all: ["Collagen, aloe barbadensis, hyaluronic acid, ginseng, retinol A, lecithin, peptides, organic oils", "Colágeno, aloe barbadensis, ácido hialurónico, ginseng, retinol A, lecitina, péptidos, aceites orgánicos"] },
    "GlutaMore": { img: "glutamore", kind: ["Sublingual drops (under the tongue)", "Gotas sublinguales (debajo de la lengua)"],
      info: ["Sublingual glutathione drops with vitamin C, taurine and arginine", "Gotas sublinguales de glutatión con vitamina C, taurina y arginina"],
      all: ["L-glutathione, vitamin C, taurine, arginine, L-valine", "L-glutatión, vitamina C, taurina, arginina, L-valina"] },
    "Painless Night": { photo: "painless-night", img: "painless-night", kind: ["Transdermal patch", "Parche transdérmico"],
      info: ["Transdermal patch with glucosamine and Korean red ginseng", "Parche transdérmico con glucosamina y ginseng rojo coreano"],
      all: ["Glucosamine, Korean red ginseng, silver ions, saponins, organic germanium", "Glucosamina, ginseng rojo coreano, iones de plata, saponinas, germanio orgánico"] },
    "SlimStyle": { photo: "slimstyle", img: "slimstyle", kind: null,
      info: ["Green tea, guarana, garcinia cambogia and L-carnitine", "Té verde, guaraná, garcinia cambogia y L-carnitina"],
      all: ["Spirulina, palmitoyl tripeptide, L-carnitine, organic ginger, green tea, guarana, garcinia cambogia", "Espirulina, palmitoil tripéptido, L-carnitina, jengibre orgánico, té verde, guaraná, garcinia cambogia"] },
    "Omevia": { photo: "omevia", img: "omevia", kind: null,
      info: ["Omega 3, coenzyme Q10, DHEA and pregnenolone", "Omega 3, coenzima Q10, DHEA y pregnenolona"],
      all: ["Omega 3, coenzyme Q10, DHEA, pregnenolone", "Omega 3, coenzima Q10, DHEA, pregnenolona"] },
    "B12 Plus": { photo: "b12-plus", img: "b12-plus", kind: null,
      info: ["Vitamins B12, B1, B3 and folic acid with vitamins C, D and E", "Vitaminas B12, B1, B3 y ácido fólico con vitaminas C, D y E"],
      all: ["Vitamin B3, vitamin B12, vitamin B1, folic acid, vitamin E, vitamin C, vitamin D", "Vitamina B3, vitamina B12, vitamina B1, ácido fólico, vitamina E, vitamina C, vitamina D"] },
    "Dekamin": { photo: "dekamin", img: "dekamin", kind: ["Transdermal patch", "Parche transdérmico"],
      info: ["Transdermal patch with vitamins D3, K2 and C plus magnesium", "Parche transdérmico con vitaminas D3, K2 y C, y magnesio"],
      all: ["Vitamin D3, vitamin K2, vitamin C, magnesium", "Vitamina D3, vitamina K2, vitamina C, magnesio"] },
    "Melatonin Plus": { photo: "melatonin-plus", img: "melatonin-plus", kind: null,
      info: ["4.4 mg melatonin with lavender and rose essential oils", "4.4 mg de melatonina con aceites esenciales de lavanda y rosa"],
      all: ["4.4 mg melatonin, lavender essential oil, rose essential oil", "4.4 mg de melatonina, aceite esencial de lavanda, aceite esencial de rosa"] },
    "Ladies Night": { photo: "ladies-night", img: "ladies-night", kind: null,
      info: ["For her: ginseng, L-arginine, zinc, ginger and red clover", "Para ella: ginseng, L-arginina, zinc, jengibre y trébol rojo"],
      all: ["Omega 3, L-arginine, zinc, ginger, ginseng, dioscorea bulbifera, red clover", "Omega 3, L-arginina, zinc, jengibre, ginseng, dioscorea bulbifera, trébol rojo"] },
    "Gentlemen Night": { photo: "gentlemen-night", img: "gentlemen-night", kind: ["Transdermal patch, for him", "Parche transdérmico, para él"],
      info: ["For him: ginseng, maca, L-arginine, zinc and eurycoma longifolia", "Para él: ginseng, maca, L-arginina, zinc y eurycoma longifolia"],
      all: ["Omega 3, L-arginine, zinc, ginger, ginseng, maca, eurycoma longifolia", "Omega 3, L-arginina, zinc, jengibre, ginseng, maca, eurycoma longifolia"] },
    "GlutaNAD+ Boost": { photo: "glutanad-boost", img: null, kind: ["Transdermal strips, 30 per box (SnapRelease)", "Tiras transdérmicas, 30 por caja (SnapRelease)"],
      info: ["Glutathione with NMN (NAD+ precursor), astaxanthin and quercetin", "Glutatión con NMN (precursor de NAD+), astaxantina y quercetina"],
      all: ["Glutathione, NMN (NAD+ precursor), astaxanthin, quercetin, vitamins B6, B12, D3 and A", "Glutatión, NMN (precursor de NAD+), astaxantina, quercetina, vitaminas B6, B12, D3 y A"] }
  };
  /* what people choose it for (same goals as the quiz) */
  var FOR = {
    "Sornie Collagen Patch": ["skin", "comfort"], "Sornie Anti-Aging Mask": ["skin"], "GlutaMore": ["skin", "energy"],
    "Painless Night": ["comfort"], "SlimStyle": ["weight"], "Omevia": ["heart"], "B12 Plus": ["energy", "heart"],
    "Dekamin": ["comfort", "heart"], "Melatonin Plus": ["sleep"], "Ladies Night": ["intimacy"], "Gentlemen Night": ["intimacy"], "GlutaNAD+ Boost": ["skin", "energy"]
  };
  window.UMUVO_PRODUCTS = P;

  var card = document.querySelector(".card"), list = card && card.querySelector(".products"), root = document.getElementById("pd");
  if (!card || !list || !root) return;

  var T = {
    en: { kicker: "Emely & Felix · U-MUVO", close: "Close", inside: "What's in it", what: "What it's for", ingr: "Ingredients and where they come from", how: "How it comes", chosen: "People choose it for",
      order: "Order on WhatsApp", ask: "Ask us a question", cat: "See it in the catalog", hint: "Tap a product to see it up close, what's in it and order", zoom: "Tap the photo to see it full screen", zoomClose: "Close photo",
      fine: "One More International describes its products as natural wellness products, not medicine. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease. Results vary. Ask your doctor before use if you are pregnant, nursing, take medication or have a health condition.",
      goals: { comfort: "Body comfort", energy: "Energy", sleep: "Rest and sleep", skin: "Skin and glow", weight: "Feeling lighter", heart: "Heart and healthy aging", intimacy: "Intimacy and vitality" },
      orderMsg: function (n) { return "Hi Emely and Felix, I'd like to order " + n + ". Can you help me?"; },
      askMsg: function (n) { return "Hi Emely and Felix, I have a question about " + n + "."; } },
    es: { kicker: "Emely & Felix · U-MUVO", close: "Cerrar", inside: "Qué contiene", what: "Para qué es", ingr: "Ingredientes y de dónde vienen", how: "Cómo viene", chosen: "Lo escogen para",
      order: "Ordenar por WhatsApp", ask: "Haznos una pregunta", cat: "Verlo en el catálogo", hint: "Toca un producto para verlo de cerca, qué contiene y ordenarlo", zoom: "Toca la foto para verla en pantalla completa", zoomClose: "Cerrar foto",
      fine: "One More International describe sus productos como productos naturales de bienestar, no como medicina. Estas declaraciones no han sido evaluadas por la Administración de Alimentos y Medicamentos (FDA). Este producto no está destinado a diagnosticar, tratar, curar ni prevenir ninguna enfermedad. Los resultados varían. Consulta a tu médico antes de usarlo si estás embarazada, lactando, tomas medicamentos o tienes alguna condición de salud.",
      goals: { comfort: "Comodidad del cuerpo", energy: "Energía", sleep: "Descanso y sueño", skin: "Piel y brillo", weight: "Sentirse más ligero", heart: "Corazón y envejecer saludable", intimacy: "Intimidad y vitalidad" },
      orderMsg: function (n) { return "Hola Emely y Felix, me gustaría pedir " + n + ". ¿Me ayudan?"; },
      askMsg: function (n) { return "Hola Emely y Felix, tengo una pregunta sobre " + n + "."; } }
  };
  function es() { return card.dataset.lang === "es"; }
  function L() { return T[es() ? "es" : "en"]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function phone() { return document.body.dataset.phone || "13212038541"; }
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
    var t = L(), p = P[name], i = es() ? 1 : 0, goals = FOR[name] || [], d = (window.UMUVO_DETAILS || {})[name];
    last = btn || null;
    root.querySelector(".pd-kicker").textContent = t.kicker;
    root.querySelector("#pdTitle").textContent = name;
    root.querySelector(".pd-x").setAttribute("aria-label", t.close);
    body.innerHTML =
      (p && p.photo
        ? '<button class="pd-photo" type="button" data-src="images/products/photo/' + p.photo + '.webp" aria-label="' + esc(t.zoom) + '"><img src="images/products/photo/' + p.photo + '.webp" alt="' + esc(name) + '" decoding="async"><span class="pd-zoomhint"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' + esc(t.zoom) + '</span></button>'
        : (p && p.img ? '<div class="pd-logo"><img src="images/products/' + p.img + '.jpg" alt="' + esc(name) + ' logo"></div>' : "")) +
      (d ? '<p class="pd-sec">' + esc(t.what) + '</p><p class="pd-txt">' + esc(d.what[i]) + "</p>" : "") +
      (p && p.kind ? '<p class="pd-sec">' + esc(t.how) + '</p><p class="pd-txt">' + esc(p.kind[i]) + "</p>" : "") +
      (d ? '<p class="pd-sec">' + esc(t.ingr) + '</p><ul class="pd-ing">' + d.ing.map(function (x) {
            return "<li><b>" + esc(x[i]) + "</b><span>" + esc(x[i + 2]) + "</span></li>"; }).join("") + "</ul>"
         : (p ? '<p class="pd-sec">' + esc(t.inside) + '</p><p class="pd-txt">' + esc(p.all[i]) + "</p>" : "")) +
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
  /* full-screen photo viewer: tap the product photo in the sheet */
  var zv = document.createElement("div"); zv.className = "pd-zoom"; zv.hidden = true;
  zv.setAttribute("role", "dialog"); zv.setAttribute("aria-modal", "true");
  zv.innerHTML = '<button class="pd-zoom-x" type="button"><svg class="ico"><use href="#i-x"/></svg></button><img alt="">';
  document.body.appendChild(zv);
  var zImg = zv.querySelector("img"), zBtn = null;
  function zoomOpen(btn) {
    zBtn = btn; zImg.src = btn.dataset.src; zImg.alt = root.querySelector("#pdTitle").textContent;
    zv.setAttribute("aria-label", zImg.alt); zv.querySelector(".pd-zoom-x").setAttribute("aria-label", L().zoomClose);
    zv.hidden = false; zv.querySelector(".pd-zoom-x").focus();
  }
  function zoomClose() { if (zv.hidden) return; zv.hidden = true; zImg.removeAttribute("src"); if (zBtn && zBtn.focus) zBtn.focus(); }
  zv.addEventListener("click", zoomClose);
  zv.addEventListener("keydown", function (e) { if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); if (e.key === "Escape") zoomClose(); } });
  body.addEventListener("click", function (e) { var b = e.target.closest(".pd-photo"); if (b) zoomOpen(b); });

  function close() { zoomClose(); root.hidden = true; document.body.classList.remove("bk-open"); if (last && last.focus) last.focus(); }

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
