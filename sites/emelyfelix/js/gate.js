/* Hidden owner door (OKUNAMI back office).
   Press and hold the name "Emely & Felix" for 5 seconds -> who's signing in -> that person's PIN
   -> personal welcome -> back office. Visitors never see anything: the ring only appears after
   the first second of holding. The PIN is checked on the server, with a lockout after 5 misses. */
(function () {
  "use strict";
  var C = window.CB_CONFIG; if (!C || !window.cbRpc) return;
  var HOLD_MS = 5000, SHOW_AFTER = 900, ADMIN_URL = "admin/";
  var TX = {
    en: { who: "Who's signing in?", enter: "Enter your PIN", hi: "Hi ", wrong: "That PIN didn't match. Try again.",
          locked: "Too many tries. Wait a few minutes and try again.", offline: "Can't reach the server. Check your connection and try again.",
          cancel: "Cancel", back: "Back", del: "Delete", hold: "Keep holding", welcome: "Welcome back, ", opening: "Opening your back office" },
    es: { who: "¿Quién está entrando?", enter: "Escribe tu PIN", hi: "Hola ", wrong: "Ese PIN no coincide. Intenta otra vez.",
          locked: "Demasiados intentos. Espera unos minutos e intenta otra vez.", offline: "No hay conexión con el servidor. Revisa tu internet e intenta otra vez.",
          cancel: "Cancelar", back: "Atrás", del: "Borrar", hold: "Sigue presionando", welcome: "Bienvenido de nuevo, ", opening: "Abriendo tu oficina" }
  };
  var card = document.querySelector(".card");
  var target = card && card.querySelector(".over h1"); if (!target) return;
  function lang() { return card.dataset.lang === "es" ? "es" : "en"; }
  function t(k) { return TX[lang()][k]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* hold ring + tip */
  target.classList.add("gate-target");
  var ring = document.createElement("span");
  ring.className = "gate-ring"; ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" class="gr-bg"/><circle cx="24" cy="24" r="20" class="gr-fg" pathLength="100"/></svg><span class="gate-tip"></span>';
  target.appendChild(ring);
  var fg = ring.querySelector(".gr-fg"), tip = ring.querySelector(".gate-tip");
  var timer = null, raf = 0, start = 0;
  function reset() { clearTimeout(timer); cancelAnimationFrame(raf); timer = null; ring.classList.remove("on"); fg.style.strokeDashoffset = "100"; }
  function tick() {
    var el = Date.now() - start;
    if (el > SHOW_AFTER) { ring.classList.add("on"); tip.textContent = t("hold"); fg.style.strokeDashoffset = String(100 - Math.min(100, (el - SHOW_AFTER) / (HOLD_MS - SHOW_AFTER) * 100)); }
    raf = requestAnimationFrame(tick);
  }
  target.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    start = Date.now(); raf = requestAnimationFrame(tick);
    timer = setTimeout(function () { reset(); if (navigator.vibrate) { try { navigator.vibrate(40); } catch (x) {} } openWho(); }, HOLD_MS);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { target.addEventListener(ev, function () { if (timer) reset(); }); });
  target.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  /* overlay */
  var ov = null, who = null, entry = "", busy = false, lastFocus = null;
  function shell(inner) {
    return '<div class="gate-card"><img class="gate-logo" src="images/logo-green.png" alt="U-MUVO" width="936" height="129">' + inner +
      '<button type="button" class="gate-cancel" data-k="cancel">' + t("cancel") + '</button></div>';
  }
  function open() {
    lastFocus = document.activeElement;
    ov = document.createElement("div"); ov.className = "gate";
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", t("who"));
    document.body.appendChild(ov); document.body.classList.add("gate-open");
  }
  function close() { if (!ov) return; ov.remove(); ov = null; who = null; entry = ""; document.body.classList.remove("gate-open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function openWho() {
    if (!ov) open();
    ov.innerHTML = shell('<h2>' + t("who") + '</h2><div class="gate-who">' +
      C.owners.map(function (o) { return '<button type="button" class="gw" data-u="' + o.id + '"><span class="gw-av">' + esc(o.name.charAt(0)) + '</span>' + esc(o.name) + '</button>'; }).join("") + '</div>');
    var b = ov.querySelector(".gw"); if (b) b.focus();
  }
  function dots() { var s = ""; for (var i = 0; i < 4; i++) s += '<i class="' + (i < entry.length ? "on" : "") + '"></i>'; return s; }
  function pad(msg, bad) {
    var keys = "";
    ["1","2","3","4","5","6","7","8","9","back","0","del"].forEach(function (k) {
      if (k === "back") keys += '<button type="button" class="gk gk-txt" data-k="back">' + t("back") + '</button>';
      else if (k === "del") keys += '<button type="button" class="gk gk-del" data-k="del" aria-label="' + t("del") + '"><svg viewBox="0 0 24 24"><path d="M9 6h11v12H9l-5-6z"/><path d="M12 10l4 4M16 10l-4 4"/></svg></button>';
      else keys += '<button type="button" class="gk" data-k="' + k + '">' + k + '</button>';
    });
    ov.innerHTML = shell('<h2>' + t("hi") + esc(who.name) + '</h2><p class="gate-sub">' + t("enter") + '</p>' +
      '<div class="gate-dots' + (bad ? " shake" : "") + '" aria-label="' + entry.length + ' / 4">' + dots() + '</div>' +
      '<p class="gate-msg" role="status">' + (msg || "") + '</p><div class="gate-keys">' + keys + '</div>');
  }
  function welcome(name) {
    ov.innerHTML = '<div class="gate-card gate-welcome"><img class="gate-logo" src="images/logo-green.png" alt="U-MUVO" width="936" height="129">' +
      '<span class="gate-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<h2>' + t("welcome") + esc(name) + '</h2><p class="gate-sub">' + t("opening") + '</p><span class="gate-spin"></span></div>';
  }
  function submit() {
    busy = true;
    window.cbRpc("cb_login", { p_slug: C.slug, p_user: who.id, p_pin: entry }).then(function (r) {
      busy = false;
      if (r && r.ok) {
        try { localStorage.setItem("cb-session-" + C.slug, JSON.stringify({ token: r.token, name: r.name, user: r.user, lang: lang() })); } catch (x) {}
        welcome(r.name);
        setTimeout(function () { location.href = ADMIN_URL; }, 1300);
        return;
      }
      entry = "";
      if (navigator.vibrate) { try { navigator.vibrate([30, 40, 30]); } catch (x) {} }
      pad(r && r.error === "locked" ? t("locked") : t("wrong"), true);
    }).catch(function () { busy = false; entry = ""; pad(t("offline"), true); });
  }
  function press(k) {
    if (busy) return;
    if (k === "cancel") return close();
    if (k === "back") { entry = ""; who = null; return openWho(); }
    if (k === "del") { entry = entry.slice(0, -1); return pad(); }
    if (entry.length >= 4) return;
    entry += k; pad();
    if (entry.length === 4) setTimeout(submit, 120);
  }
  document.addEventListener("click", function (e) {
    if (!ov) return;
    var k = e.target.closest("[data-k]"), u = e.target.closest("[data-u]");
    if (k) { e.preventDefault(); press(k.getAttribute("data-k")); }
    else if (u) { e.preventDefault(); var id = u.getAttribute("data-u"); who = C.owners.filter(function (o) { return o.id === id; })[0]; entry = ""; pad(); var f = ov.querySelector(".gk"); if (f) f.focus(); }
    else if (e.target === ov) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!ov) return;
    if (e.key === "Escape") { close(); return; }
    if (!who) return;
    if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
    else if (e.key === "Backspace") { press("del"); e.preventDefault(); }
  });
})();
