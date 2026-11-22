/* Emely & Felix back office (OKUNAMI). Finesse OS method, JA Paint Pro pattern.
   Sign-in: the hidden door on the card (hold the name 5 s) or this page's own PIN screen.
   Every private action is checked on the server with the owner's session token. */
(function () {
  "use strict";
  var C = window.CB_CONFIG, rpc = window.cbRpc;
  var SKEY = "cb-session-" + C.slug, LKEY = "cb-lang", TKEY = "cb-tips-" + C.slug;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }

  /* ---------- language ---------- */
  var lang = "en";
  try { lang = localStorage.getItem(LKEY) || (JSON.parse(localStorage.getItem(SKEY) || "{}").lang) || "en"; } catch (e) {}
  if (lang !== "es") lang = "en";
  function L(en, es) { return lang === "es" ? es : en; }
  var MONTHS = { en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
                 es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"] };
  var DAYS = { en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], es: ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"] };
  function fmtDay(iso) {
    if (!iso) return "";
    var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return lang === "es" ? DAYS.es[d.getDay()] + ", " + d.getDate() + " de " + MONTHS.es[d.getMonth()]
                         : DAYS.en[d.getDay()] + ", " + MONTHS.en[d.getMonth()] + " " + d.getDate();
  }
  function fmtStamp(ts) {
    var d = new Date(ts), h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0"), ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    var day = lang === "es" ? d.getDate() + " de " + MONTHS.es[d.getMonth()] : MONTHS.en[d.getMonth()].slice(0, 3) + " " + d.getDate();
    return day + ", " + h + ":" + m + " " + ap;
  }
  function fmtSize(n) { if (!n) return ""; n = +n; return n >= 1048576 ? (n / 1048576).toFixed(n >= 10485760 ? 0 : 1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }

  /* ---------- session ---------- */
  var S = null;
  function readSession() { try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; } }
  function saveSession(s) { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }
  function clearSession() { try { localStorage.removeItem(SKEY); } catch (e) {} }

  function boot() {
    var s = readSession();
    var bootTimer = setTimeout(function () { if (!S) showSignin(L("Can't reach the server right now. Check your connection.", "No hay conexión con el servidor. Revisa tu internet.")); }, 12000);
    if (!s || !s.token) { clearTimeout(bootTimer); return showSignin(); }
    rpc("cb_me", { p_token: s.token }).then(function (me) {
      clearTimeout(bootTimer);
      if (!me || !me.ok) { clearSession(); return showSignin(); }
      S = { token: s.token, name: me.name, user: me.user };
      startApp();
    }).catch(function () {
      clearTimeout(bootTimer);
      showSignin(L("Can't reach the server right now. Check your connection.", "No hay conexión con el servidor. Revisa tu internet."));
    });
  }

  /* ---------- sign-in screen (when the back office is opened directly) ---------- */
  var si = { who: null, entry: "", busy: false };
  function showSignin(msg) {
    $("#boot").hidden = true; $("#app").hidden = true; $("#tabBar").hidden = true;
    var box = $("#signin"); box.hidden = false;
    si.who = null; si.entry = "";
    renderWho(msg);
  }
  function siShell(inner) {
    return '<div class="si-card"><img class="si-logo" src="../images/logo-green.png" alt="U-MUVO" width="936" height="129">' + inner + "</div>";
  }
  function renderWho(msg) {
    $("#signin").innerHTML = siShell('<h2>' + L("Who's signing in?", "¿Quién está entrando?") + '</h2>' +
      (msg ? '<p class="si-msg" role="status">' + esc(msg) + "</p>" : "") +
      '<div class="si-who">' + C.owners.map(function (o) {
        return '<button type="button" data-si-who="' + o.id + '"><span class="si-av">' + esc(o.name.charAt(0)) + "</span>" + esc(o.name) + "</button>";
      }).join("") + '</div><a class="si-link" href="../" style="display:block;line-height:44px">' + L("Back to the card", "Volver a la tarjeta") + "</a>");
  }
  function renderPad(msg, bad) {
    var dots = ""; for (var i = 0; i < 4; i++) dots += '<i class="' + (i < si.entry.length ? "on" : "") + '"></i>';
    var keys = ["1","2","3","4","5","6","7","8","9"].map(function (k) { return '<button type="button" data-si-k="' + k + '">' + k + "</button>"; }).join("") +
      '<button type="button" class="txt" data-si-k="back">' + L("Back", "Atrás") + '</button><button type="button" data-si-k="0">0</button>' +
      '<button type="button" class="txt" data-si-k="del" aria-label="' + L("Delete", "Borrar") + '">' + L("Delete", "Borrar") + "</button>";
    $("#signin").innerHTML = siShell('<h2>' + L("Hi ", "Hola ") + esc(si.who.name) + '</h2><p class="si-sub">' + L("Enter your PIN", "Escribe tu PIN") + "</p>" +
      '<div class="si-dots' + (bad ? " shake" : "") + '">' + dots + '</div><p class="si-msg" role="status">' + (msg || "") + '</p><div class="si-keys">' + keys + "</div>");
  }
  function siSubmit() {
    si.busy = true;
    rpc("cb_login", { p_slug: C.slug, p_user: si.who.id, p_pin: si.entry }).then(function (r) {
      si.busy = false;
      if (r && r.ok) {
        saveSession({ token: r.token, name: r.name, user: r.user, lang: lang });
        S = { token: r.token, name: r.name, user: r.user };
        $("#signin").innerHTML = siShell('<p class="si-hi">' + L("Welcome back, ", "Bienvenido de nuevo, ") + esc(r.name) + '</p><p class="si-sub">' + L("Opening your back office", "Abriendo tu oficina") + "</p>");
        setTimeout(startApp, 700);
        return;
      }
      si.entry = "";
      renderPad(r && r.error === "locked" ? L("Too many tries. Wait a few minutes and try again.", "Demasiados intentos. Espera unos minutos e intenta otra vez.") : L("That PIN didn't match. Try again.", "Ese PIN no coincide. Intenta otra vez."), true);
    }).catch(function () { si.busy = false; si.entry = ""; renderPad(L("Can't reach the server. Try again.", "No hay conexión. Intenta otra vez."), true); });
  }
  document.addEventListener("click", function (e) {
    if ($("#signin").hidden) return;
    var w = e.target.closest("[data-si-who]"), k = e.target.closest("[data-si-k]");
    if (w) { si.who = C.owners.filter(function (o) { return o.id === w.getAttribute("data-si-who"); })[0]; si.entry = ""; renderPad(); }
    else if (k && !si.busy) siKey(k.getAttribute("data-si-k"));
  });
  function siKey(k) {
    if (k === "back") { si.who = null; si.entry = ""; return renderWho(); }
    if (k === "del") { si.entry = si.entry.slice(0, -1); return renderPad(); }
    if (si.entry.length >= 4) return;
    si.entry += k; renderPad();
    if (si.entry.length === 4) setTimeout(siSubmit, 120);
  }
  document.addEventListener("keydown", function (e) {
    if ($("#signin").hidden || !si.who || si.busy) return;
    if (/^[0-9]$/.test(e.key)) siKey(e.key); else if (e.key === "Backspace") siKey("del");
  });

  /* ---------- app shell ---------- */
  var NAV = [
    { id: "home", en: "Home", es: "Inicio", icon: "home" },
    { id: "bookings", en: "Bookings", es: "Citas", icon: "cal" },
    { id: "library", en: "Library", es: "Biblioteca", icon: "folder" },
    { id: "card", en: "My card", es: "Mi tarjeta", icon: "card" },
    { id: "settings", en: "Settings", es: "Ajustes", icon: "gear" }
  ];
  var cur = "home", bookings = null, newCount = 0;
  function startApp() {
    $("#boot").hidden = true; $("#signin").hidden = true; $("#app").hidden = false; $("#tabBar").hidden = false;
    $("#avatar").textContent = S.name.charAt(0);
    $("#avatar").setAttribute("aria-label", L("Signed in as ", "Sesión de ") + S.name);
    paintLang();
    loadBookings().then(function () { paintNav(); if (cur === "home" || cur === "bookings") render(); });
    route();
  }
  function paintNav() {
    $("#sideNav").innerHTML = NAV.map(function (n) {
      return '<button type="button" class="nav-item' + (n.id === cur ? " on" : "") + '" data-go="' + n.id + '"' + (n.id === cur ? ' aria-current="page"' : "") + ">" + ic(n.icon) + "<span>" + L(n.en, n.es) + "</span>" +
        (n.id === "bookings" && newCount ? '<span class="nav-count">' + newCount + "</span>" : "") + "</button>";
    }).join("");
    $("#tabBar").innerHTML = NAV.map(function (n) {
      return '<button type="button" class="tab' + (n.id === cur ? " on" : "") + '" data-go="' + n.id + '"' + (n.id === cur ? ' aria-current="page"' : "") + ">" + ic(n.icon) + "<span>" + L(n.en, n.es) + "</span>" +
        (n.id === "bookings" && newCount ? '<span class="dot">' + newCount + "</span>" : "") + "</button>";
    }).join("");
  }
  function paintLang() {
    document.documentElement.lang = lang;
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"); });
    $$("[data-t]").forEach(function (el) { if (!el.dataset.en) el.dataset.en = el.textContent; el.textContent = lang === "es" ? ({ "View my card": "Ver mi tarjeta" })[el.dataset.en] || el.dataset.en : el.dataset.en; });
    $("#tipsBtn").setAttribute("aria-label", L("Help tips", "Consejos de ayuda"));
  }
  function go(id) { if (cur === "card" && edDirty() && !confirm(L("You have changes that aren't saved. Leave without saving?", "Tienes cambios sin guardar. ¿Salir sin guardar?"))) return; location.hash = id; }
  function route() {
    var h = (location.hash || "#home").slice(1).split("/")[0];
    if (!NAV.some(function (n) { return n.id === h; })) h = "home";
    cur = h; paintNav(); render(); showTip(false);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", function () { if (S) route(); });
  function render() {
    var n = NAV.filter(function (x) { return x.id === cur; })[0];
    $("#crumb").textContent = L(n.en, n.es);
    document.title = L(n.en, n.es) + " | Emely & Felix";
    var v = $("#view");
    if (cur === "home") { v.innerHTML = vHome(); libFetch(C.driveRoot).then(function (it) { var k = $("#kpiLib"); if (k && it) k.textContent = it.length; }); }
    else if (cur === "bookings") v.innerHTML = vBookings();
    else if (cur === "library") { v.innerHTML = vLibrary(); libLoad(); }
    else if (cur === "card") { v.innerHTML = vCard(); edInit(); }
    else if (cur === "settings") { v.innerHTML = vSettings(); loadAudit(); }
  }

  /* ---------- help tips ---------- */
  var TIPS = {
    home: ["<b>This is your back office.</b> New booking requests from your card show up here, plus quick links to everything else.", "<b>Esta es tu oficina.</b> Aquí aparecen las citas nuevas que llegan de tu tarjeta, con accesos rápidos a todo lo demás."],
    bookings: ["<b>Every booking someone sends from your card lands here.</b> The message also goes to your WhatsApp. Mark each one Confirmed when you set it up, then Done after you meet.", "<b>Cada cita que alguien envía desde tu tarjeta llega aquí.</b> El mensaje también te llega por WhatsApp. Marca cada una Confirmada cuando la cuadres y Lista después de reunirte."],
    library: ["<b>Your team's Google Drive, right here.</b> Same folders and names. Press a file to open it, play a video, download it or share it with a prospect.", "<b>El Google Drive del equipo, aquí mismo.</b> Las mismas carpetas y nombres. Presiona un archivo para abrirlo, ver un video, descargarlo o compartirlo con un prospecto."],
    card: ["<b>Change what your card shows.</b> Nothing changes on your live card until you press Save. Every save is kept, so you can go back to an earlier version anytime.", "<b>Cambia lo que muestra tu tarjeta.</b> Nada cambia en tu tarjeta hasta que presiones Guardar. Cada versión se guarda, así puedes volver a una anterior cuando quieras."],
    settings: ["<b>Change your PIN here.</b> Each of you has your own. You can also turn these tips off.", "<b>Cambia tu PIN aquí.</b> Cada uno tiene el suyo. También puedes apagar estos consejos."]
  };
  function tipsOn() { try { return localStorage.getItem(TKEY) !== "off"; } catch (e) { return true; } }
  function tipSeen(id) { try { return localStorage.getItem(TKEY + "-" + id) === "1"; } catch (e) { return false; } }
  function showTip(force) {
    var t = $("#tip"), tx = TIPS[cur];
    if (!tx || (!force && (!tipsOn() || tipSeen(cur)))) { t.hidden = true; return; }
    t.hidden = false;
    t.innerHTML = ic("help") + '<div class="tip-b">' + tx[lang === "es" ? 1 : 0] + '<div class="tip-acts"><button type="button" data-act="tipOk">' + L("Got it", "Entendido") + '</button><button type="button" data-act="tipOff">' + L("Turn off tips", "Apagar consejos") + "</button></div></div>";
  }

  /* ---------- home ---------- */
  function greet() { var h = new Date().getHours(); return h < 12 ? L("Good morning, ", "Buenos días, ") : h < 18 ? L("Good afternoon, ", "Buenas tardes, ") : L("Good evening, ", "Buenas noches, "); }
  function vHome() {
    var list = (bookings || []), week = list.filter(function (b) { return Date.now() - new Date(b.created_at) < 7 * 864e5; }).length;
    var upcoming = list.filter(function (b) { return b.status !== "done"; }).slice(0, 3);
    return '<h2 class="h-greet">' + greet() + esc(S.name) + '</h2><p class="h-sub">' + L("Here's what's happening with your U-MUVO card.", "Esto es lo que está pasando con tu tarjeta U-MUVO.") + "</p>" +
      '<div class="kpis">' +
      '<button type="button" class="kpi" data-go="bookings">' + ic("cal") + "<b>" + (bookings ? newCount : "–") + "</b><span>" + L("New bookings", "Citas nuevas") + "</span></button>" +
      '<button type="button" class="kpi" data-go="bookings">' + ic("clock") + "<b>" + (bookings ? week : "–") + "</b><span>" + L("This week", "Esta semana") + "</span></button>" +
      '<button type="button" class="kpi" data-go="library">' + ic("folder") + "<b id=\"kpiLib\">" + (lib.cache[C.driveRoot] || DRIVE_SNAPSHOT.folders[C.driveRoot] || []).length + "</b><span>" + L("In the main folder", "En la carpeta principal") + "</span></button></div>" +
      '<section class="cardx"><div class="card-h"><h3 class="h2">' + L("Latest bookings", "Últimas citas") + '</h3><button type="button" class="link" data-go="bookings">' + L("See all", "Ver todas") + "</button></div>" +
      (bookings === null ? '<div class="empty"><span class="spin" style="display:inline-block"></span></div>' :
        upcoming.length ? upcoming.map(function (b) {
          return '<div class="row"><div class="row-b"><b>' + esc(fmtDay(b.day)) + " · " + esc(b.time_label || "") + "</b><span>" + esc(b.visitor_name || L("Someone", "Alguien")) + (b.help_type ? " · " + esc(b.help_type) : "") + "</span></div>" + badge(b.status) + "</div>";
        }).join("") : '<div class="empty">' + ic("cal") + "<b>" + L("No bookings yet", "Todavía no hay citas") + "</b>" + L("When someone books a free consultation on your card, it shows up here and on your WhatsApp.", "Cuando alguien agenda una consulta gratis en tu tarjeta, aparece aquí y en tu WhatsApp.") + "</div>") +
      "</section>" +
      '<section style="margin-top:16px"><div class="tiles">' +
      '<button type="button" class="tile go" data-go="library">' + ic("folder") + L("Open the library", "Abrir la biblioteca") + "<small>" + L("Flyers, videos, catalogs and trainings", "Flyers, videos, catálogos y capacitaciones") + "</small></button>" +
      '<button type="button" class="tile" data-go="card">' + ic("card") + L("Edit my card", "Editar mi tarjeta") + "<small>" + L("Photo, text, links and catalogs", "Foto, textos, enlaces y catálogos") + "</small></button>" +
      '<a class="tile" href="../" target="_blank" rel="noopener">' + ic("ext") + L("View my card", "Ver mi tarjeta") + "<small>emelyfelix.okunami.pro</small></a>" +
      "</div></section>";
  }

  /* ---------- bookings ---------- */
  var bkFilter = "new";
  function badge(s) { var t = { new: L("New", "Nueva"), confirmed: L("Confirmed", "Confirmada"), done: L("Done", "Lista") }[s] || s; return '<span class="badge b-' + esc(s) + '">' + esc(t) + "</span>"; }
  function loadBookings() {
    return rpc("cb_bookings_list", { p_token: S.token }).then(function (rows) {
      bookings = rows || []; newCount = bookings.filter(function (b) { return b.status === "new"; }).length;
    }).catch(function (e) { if (/not signed in/i.test(e.message)) return signOut(true); bookings = bookings || []; toast(L("Couldn't load bookings. Pull to refresh.", "No se pudieron cargar las citas.")); });
  }
  function vBookings() {
    if (bookings === null) return '<div class="empty"><span class="spin" style="display:inline-block"></span></div>';
    var list = bookings.filter(function (b) { return bkFilter === "all" || b.status === bkFilter; });
    var counts = { new: 0, confirmed: 0, done: 0 }; bookings.forEach(function (b) { counts[b.status]++; });
    var chips = [["new", L("New", "Nuevas")], ["confirmed", L("Confirmed", "Confirmadas")], ["done", L("Done", "Listas")], ["all", L("All", "Todas")]].map(function (c) {
      return '<button type="button" class="chip" data-act="bkFilter" data-v="' + c[0] + '" aria-pressed="' + (bkFilter === c[0]) + '">' + c[1] + (c[0] !== "all" ? " (" + counts[c[0]] + ")" : "") + "</button>";
    }).join("");
    return '<h2 class="h-greet">' + L("Bookings", "Citas") + '</h2><p class="h-sub">' + L("Free consultation requests sent from your card.", "Solicitudes de consulta gratis enviadas desde tu tarjeta.") + "</p>" +
      '<div class="chips" role="group" aria-label="' + L("Filter", "Filtrar") + '">' + chips + "</div>" +
      (list.length ? '<div class="bk-list">' + list.map(function (b) {
        var acts = "";
        if (b.status === "new") acts += '<button type="button" class="btn sm" data-act="bkSet" data-id="' + b.id + '" data-v="confirmed">' + ic("check") + L("Mark confirmed", "Marcar confirmada") + "</button>";
        if (b.status === "confirmed") acts += '<button type="button" class="btn sm" data-act="bkSet" data-id="' + b.id + '" data-v="done">' + ic("check") + L("Mark done", "Marcar lista") + "</button>";
        if (b.status === "done") acts += '<button type="button" class="btn sm ghost" data-act="bkSet" data-id="' + b.id + '" data-v="new">' + L("Move back to new", "Volver a nueva") + "</button>";
        acts += '<button type="button" class="btn sm ghost" data-act="bkIcs" data-id="' + b.id + '">' + ic("cal") + L("Add to calendar", "Agregar al calendario") + "</button>";
        acts += '<button type="button" class="btn sm ghost" data-act="bkDel" data-id="' + b.id + '" aria-label="' + L("Remove", "Quitar") + '">' + ic("trash") + "</button>";
        return '<article class="bk-item"><div class="bk-top"><div><div class="bk-when">' + esc(fmtDay(b.day)) + " · " + esc(b.time_label || "") + '</div><div class="bk-who">' + esc(b.visitor_name || L("Name not given", "Sin nombre")) + "</div></div>" + badge(b.status) + "</div>" +
          '<div class="bk-meta"><div><span>' + L("Topic", "Tema") + "</span><b>" + esc(b.help_type || "–") + "</b></div><div><span>" + L("City", "Ciudad") + "</span><b>" + esc(b.city || "–") + "</b></div>" +
          "<div><span>" + L("Best way to reach", "Mejor forma de contacto") + "</span><b>" + esc(b.contact_pref || "–") + "</b></div><div><span>" + L("Sent by", "Enviada por") + "</span><b>" + (b.channel === "text" ? L("Text message", "Mensaje de texto") : "WhatsApp") + " · " + esc(fmtStamp(b.created_at)) + "</b></div></div>" +
          '<div class="bk-acts">' + acts + "</div></article>";
      }).join("") + "</div>" : '<div class="cardx empty">' + ic("cal") + "<b>" + (bookings.length ? L("Nothing here", "No hay nada aquí") : L("No bookings yet", "Todavía no hay citas")) + "</b>" +
        L("When someone books a free consultation on your card, it lands here and the message goes to your WhatsApp.", "Cuando alguien agenda una consulta gratis en tu tarjeta, llega aquí y el mensaje va a tu WhatsApp.") + "</div>");
  }
  function bkById(id) { return (bookings || []).filter(function (b) { return String(b.id) === String(id); })[0]; }
  function bkSet(id, v, del) {
    var b = bkById(id); if (!b) return;
    var prev = b.status, list = bookings.slice();
    if (del) bookings = bookings.filter(function (x) { return x !== b; }); else b.status = v;
    newCount = bookings.filter(function (x) { return x.status === "new"; }).length; paintNav(); render();
    rpc("cb_booking_update", { p_token: S.token, p_id: +id, p_status: v || prev, p_delete: !!del }).then(function () {
      toast(del ? L("Booking removed", "Cita quitada") : L("Saved", "Guardado"));
    }).catch(function () {
      bookings = list; b.status = prev; newCount = bookings.filter(function (x) { return x.status === "new"; }).length; paintNav(); render();
      toast(L("That didn't save. Try again.", "No se guardó. Intenta otra vez."));
    });
  }
  function bkIcs(id) {
    var b = bkById(id); if (!b || !b.day) return;
    var m = /(\d+):(\d+)\s*(AM|PM)/i.exec(b.time_label || "9:00 AM"), h = +m[1] % 12 + (/pm/i.test(m[3]) ? 12 : 0), mi = +m[2];
    var p = b.day.split("-"), pad = function (n) { return String(n).padStart(2, "0"); };
    var st = p[0] + p[1] + p[2] + "T" + pad(h) + pad(mi) + "00", en = p[0] + p[1] + p[2] + "T" + pad(h + 1) + pad(mi) + "00";
    var title = L("U-MUVO consultation", "Consulta U-MUVO") + (b.visitor_name ? " · " + b.visitor_name : "");
    var desc = (b.message || "").replace(/\n/g, "\\n");
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OKUNAMI//Back office//EN", "BEGIN:VEVENT", "UID:cb-" + b.id + "@okunami.pro", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART:" + st, "DTEND:" + en, "SUMMARY:" + title, "DESCRIPTION:" + desc, (b.city ? "LOCATION:" + b.city : ""), "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
    var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    var a = document.createElement("a"); a.href = url; a.download = "U-MUVO-" + b.day + ".ics"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------- library (live mirror of the team's Google Drive) ---------- */
  var lib = { path: [{ id: C.driveRoot, name: C.driveRootName }], items: null, q: "", live: !!C.googleKey, cache: {} };
  function kind(m) {
    if (m === "f" || m === "application/vnd.google-apps.folder") return "folder";
    if (/^image\//.test(m)) return "img"; if (/^video\//.test(m)) return "video"; if (m === "application/pdf") return "pdf";
    if (/zip/.test(m)) return "zip"; if (/google-apps\.(document|spreadsheet|presentation)/.test(m)) return "gdoc"; return "doc";
  }
  function norm(a) { return { id: a[0], name: a[1], mime: a[2] === "f" ? "application/vnd.google-apps.folder" : a[2], size: a[3] || 0 }; }
  function sortItems(arr) {
    return arr.sort(function (a, b) {
      var fa = kind(a.mime) === "folder", fb = kind(b.mime) === "folder";
      if (fa !== fb) return fa ? -1 : 1;
      return a.name.localeCompare(b.name, "es", { sensitivity: "base", numeric: true });
    });
  }
  function libFetch(id) {
    if (lib.cache[id]) return Promise.resolve(lib.cache[id]);
    if (C.googleKey) {
      var all = [];
      var page = function (tok) {
        var u = "https://www.googleapis.com/drive/v3/files?pageSize=1000&orderBy=folder,name_natural" +
          "&fields=nextPageToken,files(id,name,mimeType,size,shortcutDetails)&supportsAllDrives=true&includeItemsFromAllDrives=true" +
          "&q=" + encodeURIComponent("'" + id + "' in parents and trashed=false") + "&key=" + encodeURIComponent(C.googleKey) + (tok ? "&pageToken=" + tok : "");
        return fetch(u).then(function (r) { if (!r.ok) throw new Error("drive " + r.status); return r.json(); }).then(function (d) {
          (d.files || []).forEach(function (f) {
            var sc = f.mimeType === "application/vnd.google-apps.shortcut" && f.shortcutDetails;
            all.push({ id: sc ? f.shortcutDetails.targetId : f.id, name: f.name, mime: sc ? f.shortcutDetails.targetMimeType : f.mimeType, size: +f.size || 0 });
          });
          return d.nextPageToken ? page(d.nextPageToken) : all;
        });
      };
      return page().then(function (items) { lib.live = true; return (lib.cache[id] = sortItems(items)); }).catch(function () { lib.live = false; return snap(id); });
    }
    return Promise.resolve(snap(id));
  }
  function snap(id) { var s = DRIVE_SNAPSHOT.folders[id]; return s ? sortItems(s.map(norm)) : null; }
  function vLibrary() {
    var p = lib.path, crumbs = p.map(function (f, i) {
      var nm = i === 0 ? L("Library", "Biblioteca") : f.name;
      return (i ? ic("right") : "") + (i === p.length - 1 ? '<span class="cur">' + esc(nm) + "</span>" : '<button type="button" data-act="libUp" data-i="' + i + '">' + esc(nm) + "</button>");
    }).join("");
    return '<div class="lib-bar"><nav class="crumbs" aria-label="' + L("Folder path", "Ruta de carpetas") + '">' + crumbs + '</nav><label class="search">' + ic("search") +
      '<span class="sr" style="position:absolute;left:-9999px">' + L("Search this folder", "Buscar en esta carpeta") + '</span><input type="search" id="libQ" placeholder="' + L("Search this folder", "Buscar en esta carpeta") + '" value="' + esc(lib.q) + '"></label></div>' +
      '<div id="libBody"><div class="empty"><span class="spin" style="display:inline-block"></span></div></div>';
  }
  function libLoad() {
    var f = lib.path[lib.path.length - 1];
    libFetch(f.id).then(function (items) { lib.items = items; if (cur === "library") libPaint(); });
  }
  function libPaint() {
    var body = $("#libBody"); if (!body) return;
    var f = lib.path[lib.path.length - 1];
    if (!lib.items) {
      body.innerHTML = '<div class="cardx empty">' + ic("folder") + "<b>" + esc(f.name) + "</b>" +
        L("This folder opens here once the live Drive connection is on. For now you can open it in Google Drive.", "Esta carpeta se abrirá aquí cuando la conexión con Drive esté activa. Por ahora puedes abrirla en Google Drive.") +
        '<p style="margin-top:14px"><a class="btn" href="https://drive.google.com/drive/folders/' + esc(f.id) + '" target="_blank" rel="noopener">' + ic("ext") + L("Open in Google Drive", "Abrir en Google Drive") + "</a></p></div>";
      return;
    }
    var q = lib.q.trim().toLowerCase();
    var items = q ? lib.items.filter(function (x) { return x.name.toLowerCase().indexOf(q) > -1; }) : lib.items;
    var folders = items.filter(function (x) { return kind(x.mime) === "folder"; }), files = items.filter(function (x) { return kind(x.mime) !== "folder"; });
    var html = (!lib.live ? '<p class="lib-note">' + L("Showing the team folder as of ", "Mostrando la carpeta del equipo al ") + esc(fmtDay(DRIVE_SNAPSHOT.date)) + ".</p>" : "");
    if (folders.length) html += '<p class="sec-label">' + L("Folders", "Carpetas") + " · " + folders.length + '</p><div class="folders">' + folders.map(function (x) {
      return '<button type="button" class="fold" data-act="libOpen" data-id="' + esc(x.id) + '">' + ic("folder") + "<span>" + esc(x.name.trim()) + "</span></button>";
    }).join("") + "</div>";
    if (files.length) html += '<p class="sec-label">' + L("Files", "Archivos") + " · " + files.length + '</p><div class="files">' + files.map(function (x) {
      var k = kind(x.mime), th;
      if (k === "img" || k === "video") th = '<img src="https://drive.google.com/thumbnail?id=' + encodeURIComponent(x.id) + '&sz=w400" alt="" loading="lazy" onerror="this.remove()">' + (k === "video" ? '<span class="play">' + ic("video") + "</span>" : ic("img"));
      else th = ic(k === "pdf" ? "pdf" : k === "zip" ? "zip" : "doc");
      var label = { img: L("Image", "Imagen"), video: "Video", pdf: "PDF", zip: "ZIP", gdoc: L("Google Doc", "Documento"), doc: L("File", "Archivo") }[k];
      return '<button type="button" class="file" data-act="libFile" data-id="' + esc(x.id) + '"><span class="thumb">' + th + '</span><span class="file-b"><b>' + esc(x.name) + "</b><span>" + label + (x.size ? " · " + fmtSize(x.size) : "") + "</span></span></button>";
    }).join("") + "</div>";
    if (!items.length) html += '<div class="cardx empty">' + ic("search") + "<b>" + (q ? L("No matches", "Sin resultados") : L("This folder is empty", "Esta carpeta está vacía")) + "</b>" + (q ? L("Try a different word.", "Prueba otra palabra.") : "") + "</div>";
    body.innerHTML = html;
  }
  function libItem(id) { return (lib.items || []).filter(function (x) { return x.id === id; })[0]; }
  function gType(m) { return /spreadsheet/.test(m) ? "spreadsheets" : /presentation/.test(m) ? "presentation" : "document"; }
  function viewUrl(x) { return kind(x.mime) === "gdoc" ? "https://docs.google.com/" + gType(x.mime) + "/d/" + x.id + "/edit" : "https://drive.google.com/file/d/" + x.id + "/view"; }
  function openViewer(x) {
    var k = kind(x.mime);
    var src = k === "gdoc" ? "https://docs.google.com/" + gType(x.mime) + "/d/" + x.id + "/preview" : "https://drive.google.com/file/d/" + x.id + "/preview";
    var v = document.createElement("div"); v.className = "viewer"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", x.name);
    var dl = k === "gdoc" ? "https://docs.google.com/" + gType(x.mime) + "/d/" + x.id + "/export?format=pdf" : "https://drive.google.com/uc?export=download&id=" + x.id;
    v.innerHTML = '<div class="viewer-h"><b>' + esc(x.name) + '</b><button type="button" class="icon-btn" data-act="closeViewer" aria-label="' + L("Close", "Cerrar") + '">' + ic("x") + "</button></div>" +
      '<div class="viewer-frame">' + (k === "zip" ? '<div class="nopv"><div>' + ic("zip") + "<p>" + L("ZIP files can't be previewed. Download it to see what's inside.", "Los archivos ZIP no se pueden ver aquí. Descárgalo para ver lo que tiene.") + "</p></div></div>"
        : '<iframe src="' + src + '" title="' + esc(x.name) + '" allow="autoplay; fullscreen" allowfullscreen></iframe>') + "</div>" +
      '<div class="viewer-f"><a class="btn" href="' + dl + '" target="_blank" rel="noopener">' + ic("down") + L("Download", "Descargar") + "</a>" +
      '<button type="button" class="btn ghost" data-act="shareFile" data-id="' + esc(x.id) + '">' + ic("share") + L("Share", "Compartir") + "</button>" +
      '<a class="btn ghost" href="' + viewUrl(x) + '" target="_blank" rel="noopener">' + ic("ext") + L("Open in Drive", "Abrir en Drive") + "</a></div>";
    document.body.appendChild(v); document.body.style.overflow = "hidden";
    v.querySelector(".icon-btn").focus();
  }
  function closeViewer() { var v = $(".viewer"); if (v) { v.remove(); document.body.style.overflow = ""; } }
  function shareFile(id) {
    var x = libItem(id); if (!x) return;
    var url = viewUrl(x), text = x.name.replace(/\.[a-z0-9]{2,4}$/i, "") + "\n" + url;
    if (navigator.share) { navigator.share({ title: x.name, url: url }).catch(function () {}); return; }
    modal(L("Share this file", "Compartir este archivo"), '<p class="muted" style="margin-top:0">' + esc(x.name) + "</p>",
      '<a class="btn" href="https://wa.me/?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener">' + ic("wa") + "WhatsApp</a>" +
      '<a class="btn ghost" href="sms:?&body=' + encodeURIComponent(text) + '">' + ic("sms") + L("Text", "Texto") + "</a>" +
      '<button type="button" class="btn ghost" data-act="copy" data-v="' + esc(url) + '">' + ic("copy") + L("Copy link", "Copiar enlace") + "</button>");
  }

  /* ---------- my card (site editor) ---------- */
  var FIELDS = [
    { group: ["Photo and name", "Foto y nombre"], items: [
      { k: "photo", type: "image", kind: "photo", label: ["Main photo", "Foto principal"], hint: ["A tall photo works best. We resize it for you.", "Una foto vertical se ve mejor. La ajustamos por ti."], def: "../images/portrait.jpg" },
      { k: "name", label: ["Name on the card", "Nombre en la tarjeta"], def: "Emely & Felix", max: 40 },
      { k: "role", pair: true, label: ["Title", "Título"], def: ["Founders", "Fundadores"], max: 40 },
      { k: "company", label: ["Company line", "Línea de la empresa"], def: "U·MUVO · One More International", max: 60 }
    ]},
    { group: ["Contact", "Contacto"], items: [
      { k: "phone", type: "tel", label: ["Phone and WhatsApp number", "Teléfono y número de WhatsApp"], hint: ["Used for Call, Text, WhatsApp, orders and bookings.", "Se usa para Llamar, Texto, WhatsApp, pedidos y citas."], def: "(321) 203-8541" },
      { k: "email", type: "email", label: ["Email", "Correo"], def: "sistersspeakeasy@hotmail.com" }
    ]},
    { group: ["Products", "Productos"], items: [
      { k: "shop_title", pair: true, label: ["Heading", "Título"], def: ["Feel the difference", "Siente la diferencia"], max: 60 },
      { k: "shop_lead", pair: true, area: true, label: ["Short description", "Descripción corta"], def: ["Transdermal patches, skin care and supplements from One More International. Browse the catalog and order through us.", "Parches transdérmicos, cuidado de la piel y suplementos de One More International. Mira el catálogo y ordena con nosotros."], max: 240 },
      { k: "products", type: "list", label: ["Products shown (one per line)", "Productos que se muestran (uno por línea)"], def: "Sornie Collagen Patch\nSornie Anti-Aging Mask\nGlutaMore\nPng #energy\nPainless Night\nSlimStyle\nOmevia\nB12 Plus\nDekamin\nMelatonin Plus\nLadies Night\nGentlemen Night" }
    ]},
    { group: ["Catalogs", "Catálogos"], items: [
      { k: "catalog_en", type: "pdf", kind: "catalog_en", label: ["English catalog (PDF)", "Catálogo en inglés (PDF)"], def: "../files/catalog-en.pdf" },
      { k: "catalog_es", type: "pdf", kind: "catalog_es", label: ["Spanish catalog (PDF)", "Catálogo en español (PDF)"], def: "../files/catalog-es.pdf" },
      { k: "cover_en", type: "image", kind: "cover_en", label: ["Catalog cover, English", "Portada del catálogo, inglés"], def: "../images/catalog-en.jpg" },
      { k: "cover_es", type: "image", kind: "cover_es", label: ["Catalog cover, Spanish", "Portada del catálogo, español"], def: "../images/catalog-es.jpg" }
    ]},
    { group: ["Join the team", "Únete al equipo"], items: [
      { k: "join_title", pair: true, label: ["Heading", "Título"], def: ["Join our team", "Únete a nuestro equipo"], max: 60 },
      { k: "join_lead", pair: true, area: true, label: ["Short description", "Descripción corta"], def: ["Build your own business with One More International, the company behind U·MUVO.", "Crea tu propio negocio con One More International, la compañía detrás de U·MUVO."], max: 240 },
      { k: "join_link", type: "url", label: ["Join link", "Enlace para unirse"], hint: ["Your One More sign-up link. Must start with https://", "Tu enlace de inscripción de One More. Debe empezar con https://"], def: "https://onemore.global/!vtwkfkl" }
    ]}
  ];
  var ed = { saved: {}, draft: {}, loaded: false };
  function edDirty() { return ed.loaded && JSON.stringify(clean(ed.draft)) !== JSON.stringify(clean(ed.saved)); }
  function clean(d) { var o = {}; Object.keys(d).sort().forEach(function (k) { var v = d[k]; if (v !== "" && v != null && !(Array.isArray(v) && !v.length)) o[k] = v; }); return o; }
  function val(f, suffix) {
    var k = f.k + (suffix || ""), v = ed.draft[k];
    if (v != null && v !== "") return Array.isArray(v) ? v.join("\n") : v;
    if (f.pair) return f.def[suffix === "_es" ? 1 : 0];
    return f.type === "image" || f.type === "pdf" ? "" : f.def;
  }
  function vCard() {
    return '<h2 class="h-greet">' + L("My card", "Mi tarjeta") + '</h2><p class="h-sub">' + L("Change what people see on emelyfelix.okunami.pro. Leave a box as it is to keep the original.", "Cambia lo que la gente ve en emelyfelix.okunami.pro. Deja un campo como está para mantener el original.") + "</p>" +
      '<div class="ed-grid"><form id="edForm" novalidate>' + FIELDS.map(function (g) {
        return "<fieldset><legend>" + L(g.group[0], g.group[1]) + "</legend>" + g.items.map(fieldHtml).join("") + "</fieldset>";
      }).join("") + "</form>" +
      '<aside class="ed-side"><div class="cardx savebar"><button type="button" class="btn dark" id="edSave" disabled>' + ic("check") + L("Save changes", "Guardar cambios") + '</button><p class="state" id="edState" role="status"></p>' +
      '<a class="btn ghost" href="../" target="_blank" rel="noopener">' + ic("ext") + L("See my card", "Ver mi tarjeta") + "</a></div>" +
      '<div class="cardx"><div class="card-h"><h3 class="h2">' + L("Saved versions", "Versiones guardadas") + '</h3></div><div id="edHist"><p class="muted">' + L("Loading…", "Cargando…") + "</p></div>" +
      '<button type="button" class="link" data-act="edReset">' + L("Go back to the original card", "Volver a la tarjeta original") + "</button></div></aside></div>";
  }
  function fieldHtml(f) {
    var id = "f_" + f.k, lab = L(f.label[0], f.label[1]), hint = f.hint ? '<span class="hint">' + L(f.hint[0], f.hint[1]) + "</span>" : "";
    if (f.pair) {
      var inp = function (sfx, ln) {
        var v = esc(val(f, sfx)), attrs = ' id="' + id + sfx + '" data-k="' + f.k + sfx + '"' + (f.max ? ' maxlength="' + f.max + '"' : "");
        return '<div class="f"><label for="' + id + sfx + '">' + lab + " · " + ln + "</label>" + (f.area ? "<textarea" + attrs + ">" + v + "</textarea>" : '<input type="text"' + attrs + ' value="' + v + '">') + "</div>";
      };
      return '<div class="pair">' + inp("_en", "English") + inp("_es", "Español") + "</div>";
    }
    if (f.type === "image" || f.type === "pdf") {
      var cur = ed.draft[f.k] || f.def, isImg = f.type === "image";
      return '<div class="f"><span style="font-weight:600;font-size:14.5px;color:var(--brand)">' + lab + "</span>" + hint +
        '<div class="up">' + (isImg ? '<img src="' + esc(cur) + '" alt="" id="' + id + '_pv">' : '<span class="icon-btn" aria-hidden="true">' + ic("pdf") + "</span>") +
        '<span class="fileinfo" id="' + id + '_info">' + (ed.draft[f.k] ? L("Your upload", "Tu archivo") : L("Original", "Original")) + (isImg ? "" : ' · <a href="' + esc(cur) + '" target="_blank" rel="noopener">' + L("Open", "Abrir") + "</a>") + "</span>" +
        '<label class="btn sm ghost" style="cursor:pointer">' + ic("upload") + L("Upload new", "Subir nuevo") + '<input type="file" hidden data-up="' + f.k + '" data-kind="' + f.kind + '" accept="' + (isImg ? "image/jpeg,image/png,image/webp" : "application/pdf") + '"></label>' +
        (ed.draft[f.k] ? '<button type="button" class="link" data-act="edClear" data-k="' + f.k + '">' + L("Use original", "Usar original") + "</button>" : "") + "</div></div>";
    }
    var type = f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text";
    var at = ' id="' + id + '" data-k="' + f.k + '"' + (f.max ? ' maxlength="' + f.max + '"' : "");
    return '<div class="f"><label for="' + id + '">' + lab + "</label>" + hint + (f.type === "list" ? '<textarea rows="7"' + at + ">" + esc(val(f)) + "</textarea>" : '<input type="' + type + '"' + at + ' value="' + esc(val(f)) + '"' + (type === "tel" ? ' inputmode="tel" autocomplete="tel"' : "") + ">") + "</div>";
  }
  function edInit() {
    var load = ed.loaded ? Promise.resolve() : fetch(C.url + "/rest/v1/cb_content?card_slug=eq." + C.slug + "&select=data", { headers: { apikey: C.anon, Authorization: "Bearer " + C.anon } })
      .then(function (r) { return r.json(); }).then(function (rows) { ed.saved = (rows && rows[0] && rows[0].data) || {}; ed.draft = JSON.parse(JSON.stringify(ed.saved)); ed.loaded = true; $("#view").innerHTML = vCard(); });
    load.then(function () { edBind(); edState(); loadHistory(); }).catch(function () { toast(L("Couldn't load your card. Try again.", "No se pudo cargar tu tarjeta.")); });
  }
  function fieldDef(k) { var out = null; FIELDS.forEach(function (g) { g.items.forEach(function (f) { if (f.k === k || k.indexOf(f.k + "_") === 0 && f.pair) out = f; }); }); return out; }
  function edBind() {
    var form = $("#edForm"); if (!form) return;
    form.addEventListener("input", function (e) {
      var el = e.target, k = el.dataset.k; if (!k) return;
      var f = fieldDef(k), v = el.value;
      var def = f.pair ? f.def[/_es$/.test(k) ? 1 : 0] : f.def;
      if (f.type === "list") { var arr = v.split("\n").map(function (s) { return s.trim(); }).filter(Boolean); ed.draft[k] = arr.join("\n") === String(def) ? undefined : arr; }
      else ed.draft[k] = v.trim() === String(def).trim() || !v.trim() ? undefined : v.trim();
      if (ed.draft[k] === undefined) delete ed.draft[k];
      el.classList.toggle("changed", JSON.stringify(ed.draft[k]) !== JSON.stringify(ed.saved[k]));
      edState();
    });
    form.addEventListener("change", function (e) { if (e.target.matches("[data-up]")) upload(e.target); });
    $("#edSave").addEventListener("click", edSave);
  }
  function edState(msg, ok) {
    var b = $("#edSave"), s = $("#edState"); if (!b) return;
    var dirty = edDirty(); b.disabled = !dirty;
    s.className = "state" + (ok ? " ok" : "");
    s.textContent = msg || (dirty ? L("You have changes that aren't saved yet.", "Tienes cambios sin guardar.") : L("Everything is saved.", "Todo está guardado."));
  }
  function validate() {
    var d = ed.draft;
    if (d.phone && String(d.phone).replace(/\D/g, "").replace(/^1/, "").length !== 10) return L("The phone number needs 10 digits.", "El teléfono necesita 10 dígitos.");
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return L("That email doesn't look right.", "Ese correo no parece correcto.");
    if (d.join_link && !/^https:\/\/\S+$/.test(d.join_link)) return L("The join link must start with https://", "El enlace debe empezar con https://");
    return "";
  }
  function edSave() {
    var err = validate(); if (err) { edState(err); toast(err); return; }
    var data = clean(ed.draft), b = $("#edSave");
    ["role", "shop_title", "shop_lead", "join_title", "join_lead"].forEach(function (k) { /* keep pairs as they are */ });
    b.disabled = true; edState(L("Saving…", "Guardando…"));
    rpc("cb_content_save", { p_token: S.token, p_data: data }).then(function () {
      ed.saved = JSON.parse(JSON.stringify(data)); ed.draft = JSON.parse(JSON.stringify(data));
      $$("#edForm .changed").forEach(function (el) { el.classList.remove("changed"); });
      try { localStorage.setItem("cb-content-" + C.slug, JSON.stringify(data)); } catch (e) {}
      edState(L("Saved. Your card is updated.", "Guardado. Tu tarjeta ya está actualizada."), true); toast(L("Saved", "Guardado")); loadHistory();
    }).catch(function (e) { if (/not signed in/i.test(e.message)) return signOut(true); edState(L("That didn't save. Check your connection and try again.", "No se guardó. Revisa tu internet e intenta otra vez.")); b.disabled = false; });
  }
  function loadHistory() {
    rpc("cb_content_history_list", { p_token: S.token }).then(function (rows) {
      var h = $("#edHist"); if (!h) return;
      h.innerHTML = rows && rows.length ? rows.slice(0, 10).map(function (r) {
        return '<div class="row"><div class="row-b"><b>' + esc(fmtStamp(r.saved_at)) + "</b><span>" + L("Before a save by ", "Antes de guardar, por ") + esc(r.saved_by || "") + '</span></div><button type="button" class="btn sm ghost" data-act="edRestore" data-id="' + r.id + '">' + ic("history") + L("Restore", "Restaurar") + "</button></div>";
      }).join("") : '<p class="muted" style="margin:0">' + L("Each time you save, the version before it is kept here.", "Cada vez que guardas, la versión anterior se guarda aquí.") + "</p>";
    }).catch(function () {});
  }
  function restore(id) {
    rpc("cb_content_restore", { p_token: S.token, p_id: id }).then(function (d) {
      ed.saved = d || {}; ed.draft = JSON.parse(JSON.stringify(ed.saved));
      try { localStorage.setItem("cb-content-" + C.slug, JSON.stringify(ed.saved)); } catch (e) {}
      closeModal(); $("#view").innerHTML = vCard(); edBind(); edState(L("Restored. Your card is updated.", "Restaurado. Tu tarjeta ya está actualizada."), true); loadHistory();
      toast(L("Restored", "Restaurado"));
    }).catch(function () { toast(L("That didn't work. Try again.", "No funcionó. Intenta otra vez.")); });
  }
  function upload(input) {
    var file = input.files && input.files[0]; if (!file) return;
    var k = input.dataset.up, kindName = input.dataset.kind, isImg = /^image\//.test(file.type);
    if (!isImg && file.type !== "application/pdf") { toast(L("Pick a photo or a PDF.", "Elige una foto o un PDF.")); return; }
    if (!isImg && file.size > 30 * 1048576) { toast(L("That PDF is over 30 MB. Try a smaller one.", "Ese PDF pasa de 30 MB. Prueba uno más pequeño.")); return; }
    var info = $("#f_" + k + "_info"); if (info) info.textContent = L("Uploading…", "Subiendo…");
    (isImg ? shrink(file, kindName === "photo" ? 1400 : 1200) : Promise.resolve(file)).then(function (blob) {
      var ext = isImg ? "jpg" : "pdf";
      return fetch(C.url + "/functions/v1/cb-upload", { method: "POST", headers: { apikey: C.anon, Authorization: "Bearer " + C.anon, "Content-Type": "application/json" }, body: JSON.stringify({ token: S.token, kind: kindName, ext: ext }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "upload"); return d; }); })
        .then(function (d) {
          return fetch(d.signedUrl, { method: "PUT", headers: { "Content-Type": isImg ? "image/jpeg" : "application/pdf", "x-upsert": "true" }, body: blob })
            .then(function (r) { if (!r.ok) throw new Error("put " + r.status); return d.publicUrl; });
        });
    }).then(function (url) {
      ed.draft[k] = url;
      var y = window.scrollY; $("#view").innerHTML = vCard(); edBind(); edState(); loadHistory(); window.scrollTo(0, y);
      toast(L("Uploaded. Press Save changes to put it on your card.", "Subido. Presiona Guardar cambios para ponerlo en tu tarjeta."));
    }).catch(function () { if (info) info.textContent = L("Upload failed. Try again.", "No se pudo subir. Intenta otra vez."); });
  }
  function shrink(file, max) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? res(b) : rej(new Error("resize")); }, "image/jpeg", 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("image")); };
      img.src = u;
    });
  }

  /* ---------- settings ---------- */
  function vSettings() {
    return '<h2 class="h-greet">' + L("Settings", "Ajustes") + '</h2><p class="h-sub">' + L("Signed in as ", "Sesión de ") + esc(S.name) + ".</p>" +
      '<section class="cardx"><h3 class="h2" style="margin-bottom:12px">' + L("Change my PIN", "Cambiar mi PIN") + '</h3><form id="pinForm" novalidate>' +
      '<div class="f"><label for="pOld">' + L("Current PIN", "PIN actual") + '</label><input id="pOld" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password"></div>' +
      '<div class="pair"><div class="f"><label for="pNew">' + L("New PIN (4 numbers)", "PIN nuevo (4 números)") + '</label><input id="pNew" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password"></div>' +
      '<div class="f"><label for="pNew2">' + L("Type it again", "Escríbelo otra vez") + '</label><input id="pNew2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password"></div></div>' +
      '<p class="si-msg" id="pinMsg" role="status" style="text-align:left"></p><button type="submit" class="btn dark">' + L("Save new PIN", "Guardar PIN nuevo") + "</button></form></section>" +
      '<section class="cardx"><h3 class="h2" style="margin-bottom:12px">' + L("Help tips", "Consejos de ayuda") + '</h3><label class="row" style="border:0;cursor:pointer"><input type="checkbox" id="tipsT" ' + (tipsOn() ? "checked" : "") + ' style="width:22px;height:22px;accent-color:#5f8f1f"><span class="row-b"><b>' + L("Show help tips", "Mostrar consejos") + "</b><span>" + L("A short note at the top of each screen.", "Una nota corta arriba de cada pantalla.") + "</span></span></label></section>" +
      '<section class="cardx"><h3 class="h2" style="margin-bottom:6px">' + L("Recent activity", "Actividad reciente") + '</h3><div id="audit"><p class="muted">' + L("Loading…", "Cargando…") + "</p></div></section>" +
      '<section class="cardx"><button type="button" class="btn ghost" data-act="signOut">' + ic("out") + L("Sign out", "Cerrar sesión") + "</button></section>";
  }
  function loadAudit() {
    var f = $("#pinForm");
    if (f) f.addEventListener("submit", function (e) {
      e.preventDefault();
      var o = $("#pOld").value, n = $("#pNew").value, n2 = $("#pNew2").value, m = $("#pinMsg");
      if (!/^\d{4}$/.test(n)) { m.textContent = L("The new PIN needs exactly 4 numbers.", "El PIN nuevo necesita 4 números."); return; }
      if (n !== n2) { m.textContent = L("The two new PINs don't match.", "Los dos PIN nuevos no coinciden."); return; }
      rpc("cb_change_pin", { p_token: S.token, p_old: o, p_new: n }).then(function (r) {
        if (r && r.ok) { f.reset(); m.textContent = ""; toast(L("Your new PIN is saved", "Tu PIN nuevo está guardado")); }
        else m.textContent = r && r.error === "wrong" ? L("Your current PIN didn't match.", "Tu PIN actual no coincide.") : L("Use 4 numbers.", "Usa 4 números.");
      }).catch(function () { m.textContent = L("That didn't save. Try again.", "No se guardó. Intenta otra vez."); });
    });
    var t = $("#tipsT"); if (t) t.addEventListener("change", function () { try { localStorage.setItem(TKEY, t.checked ? "on" : "off"); } catch (e) {} if (t.checked) showTip(true); else $("#tip").hidden = true; });
    rpc("cb_audit_list", { p_token: S.token }).then(function (rows) {
      var a = $("#audit"); if (!a) return;
      var tr = function (s) { if (lang !== "es") return s; return s.replace("signed in", "entró").replace("saved card changes", "guardó cambios en la tarjeta").replace("changed PIN", "cambió su PIN").replace(/^removed booking/, "quitó la cita").replace(/^marked booking (\d+) /, "marcó la cita $1 como "); };
      a.innerHTML = rows && rows.length ? rows.slice(0, 15).map(function (r) { return '<div class="row"><div class="row-b"><b>' + esc(r.user_name || "") + " " + esc(tr(r.action)) + "</b><span>" + esc(fmtStamp(r.at)) + "</span></div></div>"; }).join("") : '<p class="muted">' + L("Nothing yet.", "Nada todavía.") + "</p>";
    }).catch(function () {});
  }
  function signOut(expired) {
    if (S && !expired) rpc("cb_logout", { p_token: S.token }).catch(function () {});
    clearSession(); S = null; bookings = null;
    showSignin(expired ? L("Your session ended. Sign in again.", "Tu sesión terminó. Entra otra vez.") : "");
  }

  /* ---------- modal + toast ---------- */
  var lastFocus = null;
  function modal(title, body, foot) {
    lastFocus = document.activeElement;
    $("#modalTitle").textContent = title; $("#modalBody").innerHTML = body; $("#modalFoot").innerHTML = foot || "";
    $("#modal").hidden = false; var f = $("#modal .modal-f button, #modal .modal-f a, #modal input"); if (f) f.focus();
  }
  function closeModal() { $("#modal").hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600); }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]"); if (g && S) { e.preventDefault(); go(g.dataset.go); return; }
    var l = e.target.closest(".lang button");
    if (l) { lang = l.dataset.lang; try { localStorage.setItem(LKEY, lang); } catch (x) {} paintLang(); paintNav(); if (cur === "card") { var y = window.scrollY; $("#view").innerHTML = vCard(); edBind(); edState(); loadHistory(); window.scrollTo(0, y); } else render(); showTip(false); return; }
    if (e.target.closest("#tipsBtn")) { showTip(true); return; }
    if (e.target === $("#modal")) { closeModal(); return; }
    if (e.target.classList && e.target.classList.contains("viewer")) { closeViewer(); return; }
    var a = e.target.closest("[data-act]"); if (!a) return;
    var act = a.dataset.act, id = a.dataset.id;
    if (act === "closeModal") closeModal();
    else if (act === "tipOk") { try { localStorage.setItem(TKEY + "-" + cur, "1"); } catch (x) {} $("#tip").hidden = true; }
    else if (act === "tipOff") { try { localStorage.setItem(TKEY, "off"); } catch (x) {} $("#tip").hidden = true; toast(L("Tips are off. Turn them back on in Settings.", "Consejos apagados. Puedes prenderlos en Ajustes.")); }
    else if (act === "bkFilter") { bkFilter = a.dataset.v; render(); }
    else if (act === "bkSet") bkSet(id, a.dataset.v);
    else if (act === "bkIcs") bkIcs(id);
    else if (act === "bkDel") modal(L("Remove this booking?", "¿Quitar esta cita?"), "<p>" + L("It disappears from your list. The WhatsApp message stays on your phone.", "Desaparece de tu lista. El mensaje de WhatsApp se queda en tu teléfono.") + "</p>",
      '<button type="button" class="btn ghost" data-act="closeModal">' + L("Keep it", "Dejarla") + '</button><button type="button" class="btn danger" data-act="bkDelYes" data-id="' + id + '">' + L("Remove", "Quitar") + "</button>");
    else if (act === "bkDelYes") { closeModal(); bkSet(id, null, true); }
    else if (act === "libOpen") { var it = libItem(id); if (it) { lib.path.push({ id: it.id, name: it.name.trim() }); lib.q = ""; $("#view").innerHTML = vLibrary(); libLoad(); window.scrollTo(0, 0); } }
    else if (act === "libUp") { lib.path = lib.path.slice(0, +a.dataset.i + 1); lib.q = ""; $("#view").innerHTML = vLibrary(); libLoad(); }
    else if (act === "libFile") { var x = libItem(id); if (x) openViewer(x); }
    else if (act === "closeViewer") closeViewer();
    else if (act === "shareFile") shareFile(id);
    else if (act === "copy") { (navigator.clipboard ? navigator.clipboard.writeText(a.dataset.v) : Promise.reject()).then(function () { toast(L("Link copied", "Enlace copiado")); }, function () { prompt(L("Copy this link", "Copia este enlace"), a.dataset.v); }); }
    else if (act === "edClear") { delete ed.draft[a.dataset.k]; var y = window.scrollY; $("#view").innerHTML = vCard(); edBind(); edState(); loadHistory(); window.scrollTo(0, y); }
    else if (act === "edRestore") modal(L("Restore this version?", "¿Restaurar esta versión?"), "<p>" + L("Your card goes back to how it looked then. What it shows now is kept as a version too, so you can undo this.", "Tu tarjeta vuelve a como estaba en ese momento. Lo que muestra ahora también se guarda, así puedes deshacerlo.") + "</p>",
      '<button type="button" class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button type="button" class="btn dark" data-act="edRestoreYes" data-id="' + id + '">' + L("Restore", "Restaurar") + "</button>");
    else if (act === "edRestoreYes") restore(+id);
    else if (act === "edReset") {
      var word = L("RESET", "REINICIAR");
      modal(L("Go back to the original card?", "¿Volver a la tarjeta original?"), "<p>" + L("Every change you made is removed from the live card. Your current version is kept under Saved versions in case you want it back.", "Se quitan todos los cambios de tu tarjeta. Tu versión actual se guarda en Versiones guardadas por si la quieres de vuelta.") + "</p>" +
        '<div class="f"><label for="resetW">' + L("Type ", "Escribe ") + "<b>" + word + "</b>" + L(" to confirm", " para confirmar") + '</label><input id="resetW" autocomplete="off" autocapitalize="characters"></div>',
        '<button type="button" class="btn ghost" data-act="closeModal">' + L("Cancel", "Cancelar") + '</button><button type="button" class="btn danger" id="resetGo" disabled data-act="edResetYes">' + L("Go back to the original", "Volver al original") + "</button>");
      $("#resetW").addEventListener("input", function () { $("#resetGo").disabled = this.value.trim().toUpperCase() !== word; });
    }
    else if (act === "edResetYes") { if (!a.disabled) restore(null); }
    else if (act === "signOut") signOut(false);
  });
  document.addEventListener("input", function (e) { if (e.target.id === "libQ") { lib.q = e.target.value; libPaint(); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if ($(".viewer")) closeViewer(); else if (!$("#modal").hidden) closeModal(); } });
  window.addEventListener("beforeunload", function (e) { if (cur === "card" && edDirty()) { e.preventDefault(); e.returnValue = ""; } });

  boot();
})();
