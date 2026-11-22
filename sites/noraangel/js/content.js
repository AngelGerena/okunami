/* Applies the owners' saved edits from the back office on top of the card's built-in text.
   Anything not saved keeps the original. A cached copy is applied first so returning
   visitors don't see the old text flash. Also logs booking requests for the back office. */
(function () {
  "use strict";
  var C = window.CB_CONFIG; if (!C) return;
  var KEY = "cb-content-" + C.slug;
  var card = document.querySelector(".card"); if (!card) return;
  function $(s) { return card.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function digits(p) { var d = String(p || "").replace(/\D/g, ""); if (d.length === 10) d = "1" + d; return d.length === 11 ? d : ""; }
  function pair(el, en, es) {
    if (!el || (!en && !es)) return;
    if (en) el.dataset.en = esc(en);
    if (es) el.dataset.es = esc(es);
    var isEs = card.dataset.lang === "es";
    el.innerHTML = isEs ? el.dataset.es : (el.dataset.en || el.innerHTML);
  }
  function apply(d) {
    if (!d || typeof d !== "object") return;
    if (d.photo) { var ph = $(".photo"); if (ph) ph.src = d.photo; }
    if (d.name) { var h = $(".over h1"); if (h) h.textContent = d.name; }
    pair($(".role > span[data-es]"), d.role_en, d.role_es);
    if (d.company) { var u = $(".role .u"); if (u) u.textContent = d.company; }
    var ph10 = digits(d.phone);
    if (ph10) {
      document.body.dataset.phone = ph10;
      card.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.href = "tel:+" + ph10; });
      card.querySelectorAll('a[href^="sms:"]:not([data-own-sms])').forEach(function (a) { a.href = "sms:+" + ph10; });
      card.querySelectorAll('a[href^="https://wa.me/"]:not([data-own])').forEach(function (a) { a.href = "https://wa.me/" + ph10; });
    }
    var ph2 = digits(d.phone2); if (ph2) document.body.dataset.phone2 = ph2;
    if (d.email) { card.querySelectorAll('a[href^="mailto:"]').forEach(function (a) { a.href = "mailto:" + d.email; }); document.body.dataset.email = d.email; }
    pair($(".shop h2 > span"), d.shop_title_en, d.shop_title_es);
    pair($(".shop .lead > span"), d.shop_lead_en, d.shop_lead_es);
    if (Array.isArray(d.products) && d.products.length) {
      var ul = $(".products"); if (ul) ul.innerHTML = d.products.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    }
    if (d.catalog_en) card.querySelectorAll('a[href$="catalog-en.pdf"], a[data-cat-en]').forEach(function (a) { a.href = d.catalog_en; a.setAttribute("data-cat-en", ""); });
    if (d.catalog_es) card.querySelectorAll('a[href$="catalog-es.pdf"], a[data-cat-es]').forEach(function (a) { a.href = d.catalog_es; a.setAttribute("data-cat-es", ""); });
    var cover = $(".cover");
    if (cover) {
      cover.dataset.enHref = d.catalog_en || cover.dataset.enHref || "files/catalog-en.pdf";
      cover.dataset.esHref = d.catalog_es || cover.dataset.esHref || "files/catalog-es.pdf";
      cover.href = card.dataset.lang === "es" ? cover.dataset.esHref : cover.dataset.enHref;
      var ci = cover.querySelector("img");
      if (ci && d.cover_en) { ci.dataset.enSrc = d.cover_en; if (card.dataset.lang !== "es") ci.src = d.cover_en; }
      if (ci && d.cover_es) { ci.setAttribute("data-es-src", d.cover_es); if (card.dataset.lang === "es") ci.src = d.cover_es; }
    }
    pair($(".join h2 > span"), d.join_title_en, d.join_title_es);
    pair($(".join .lead > span"), d.join_lead_en, d.join_lead_es);
    if (d.join_link && /^https:\/\//.test(d.join_link)) { var j = $(".join-btn"); if (j) j.href = d.join_link; }
    window.CB_CONTENT = d;
  }
  var cached = null; try { cached = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (cached) apply(cached);
  fetch(C.url + "/rest/v1/cb_content?card_slug=eq." + C.slug + "&select=data", { headers: { apikey: C.anon, Authorization: "Bearer " + C.anon } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rows) {
      var d = rows && rows[0] ? rows[0].data : {};
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
      if (JSON.stringify(d) !== JSON.stringify(cached)) { if (cached && !Object.keys(d).length) location.reload(); else apply(d); }
    }).catch(function () {});

  /* Booking log: called by main.js when a visitor sends a booking request */
  window.cbLogBooking = function (b) {
    try {
      fetch(C.url + "/rest/v1/cb_bookings", {
        method: "POST", keepalive: true,
        headers: { apikey: C.anon, Authorization: "Bearer " + C.anon, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ card_slug: C.slug, day: b.day, time_label: b.time, help_type: b.type || null, visitor_name: b.name || null,
          city: b.city || null, contact_pref: b.how || null, lang: b.lang, channel: b.channel, message: b.message })
      }).catch(function () {});
    } catch (e) {}
  };
})();
