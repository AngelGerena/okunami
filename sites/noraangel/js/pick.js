/* Two phones on one card: Angel and Nora.
   Every WhatsApp, Call and Text link on the card (buttons, orders, products, quiz, bookings, join)
   first asks "Who do you want to reach?" and then opens it with that person's number.
   Numbers can be changed in the back office (Nora = phone, Angel = phone2). */
(function () {
  "use strict";
  var DEF = { nora: "14077310427", angel: "14079609004" };
  function num(who) { var b = document.body.dataset; return who === "angel" ? (b.phone2 || DEF.angel) : (b.phone || DEF.nora); }
  var TX = {
    en: { t: { wa: "Who do you want to WhatsApp?", tel: "Who do you want to call?", sms: "Who do you want to text?" }, sub: "Both of us can help you.", cancel: "Cancel" },
    es: { t: { wa: "¿A quién le escribes por WhatsApp?", tel: "¿A quién quieres llamar?", sms: "¿A quién le envías un texto?" }, sub: "Los dos te podemos ayudar.", cancel: "Cancelar" }
  };
  function lang() { var c = document.querySelector(".card"); return c && c.dataset.lang === "es" ? "es" : "en"; }
  function kind(href) {
    if (/^https:\/\/wa\.me\/\d+/.test(href)) return "wa";
    if (/^tel:\+?\d+/.test(href)) return "tel";
    if (/^sms:\+?\d+/.test(href)) return "sms";
    return "";
  }
  function swap(href, n) {
    return href.replace(/^(https:\/\/wa\.me\/)\d+/, "$1" + n).replace(/^(tel:\+?)\d+/, "tel:+" + n).replace(/^(sms:\+?)\d+/, "sms:+" + n);
  }
  function fmt(n) { var d = String(n).replace(/^1/, ""); return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6); }

  var ov = null, pending = null, lastFocus = null;
  function close() { if (!ov) return; ov.remove(); ov = null; pending = null; document.body.classList.remove("pk-open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function open(a, k) {
    var t = TX[lang()];
    lastFocus = a; pending = { href: a.getAttribute("href"), k: k, blank: a.target === "_blank" || k === "wa" };
    ov = document.createElement("div"); ov.className = "pk"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "pkT");
    var ico = k === "wa" ? "#i-wa" : k === "tel" ? "#i-phone" : "#i-text";
    function row(who, name, img) {
      return '<button type="button" class="pk-p" data-pk="' + who + '"><img src="' + img + '" alt="" width="56" height="56"><span><b>' + name + '</b><small>' + fmt(num(who)) + '</small></span><svg class="ico"><use href="' + ico + '"/></svg></button>';
    }
    ov.innerHTML = '<div class="pk-sheet"><p class="pk-k">U&middot;MUVO</p><h2 id="pkT">' + t.t[k] + '</h2><p class="pk-sub">' + t.sub + '</p>' +
      row("angel", "Angel", "images/angel.jpg") + row("nora", "Nora", "images/nora.jpg") +
      '<button type="button" class="pk-x" data-pk="x">' + t.cancel + '</button></div>';
    document.body.appendChild(ov); document.body.classList.add("pk-open");
    var f = ov.querySelector(".pk-p"); if (f) f.focus();
  }
  function go(who) {
    var p = pending; close(); if (!p) return;
    var url = swap(p.href, num(who));
    if (p.blank) { var w = window.open(url, "_blank", "noopener"); if (!w) location.href = url; } else location.href = url;
  }
  /* capture phase: runs before the link opens; other click handlers (booking log) still run */
  document.addEventListener("click", function (e) {
    if (ov) {
      var b = e.target.closest("[data-pk]");
      if (b) { e.preventDefault(); var w = b.getAttribute("data-pk"); if (w === "x") close(); else go(w); }
      else if (e.target === ov) close();
      return;
    }
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    if (a.hasAttribute("data-own") || a.hasAttribute("data-own-sms") || a.hasAttribute("data-direct") || a.getAttribute("aria-disabled") === "true") return;
    var k = kind(a.getAttribute("href")); if (!k) return;
    e.preventDefault(); open(a, k);
  }, true);
  document.addEventListener("keydown", function (e) { if (ov && e.key === "Escape") close(); });
})();
