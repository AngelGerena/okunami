/* Emely & Felix back office: guided help tips (JA Paint Pro pattern).
   The first time each person opens a page, a short trail of tips walks through it,
   pointing at the real buttons one step at a time. The ? button in the top bar replays
   the tips for the page, starts the full tour again, or turns tips on or off; Settings
   has the same switch. Remembered per person, so Emely and Felix each get the tour.
   Listens for "cb:render" from admin.js. */
(function () {
  "use strict";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function key() { return window.CB_TIPS_KEY || "cb-tips"; }
  function isOn() { return store(key()) !== "off"; }
  function user() { return (window.CB_USER && window.CB_USER()) || ""; }
  function seenKey() { return key() + "-seen-" + user().toLowerCase(); }
  function seen() { try { return JSON.parse(store(seenKey()) || "[]"); } catch (e) { return []; } }
  function markSeen(v) { var s = seen(); if (s.indexOf(v) < 0) { s.push(v); store(seenKey(), JSON.stringify(s)); } }
  function es() { return window.CB_LANG && window.CB_LANG() === "es"; }
  function T(p) { return (es() ? p[1] : p[0]).replace(/\{name\}/g, user() || (es() ? "amigo" : "friend")); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var TRAILS = {
    home: [
      { sel: null, t: ["Welcome to your back office, {name}", "Bienvenido a tu oficina, {name}"],
        d: ["This is where you run your U-MUVO card: booking requests, new leads from your wellness quiz, your team's library and what your card shows. Here's a quick tour. It only takes a minute.",
            "Aquí manejas tu tarjeta U-MUVO: las citas que te piden, los prospectos nuevos de tu quiz de bienestar, la biblioteca del equipo y lo que muestra tu tarjeta. Te damos un recorrido rápido. Toma un minuto."] },
      { sel: ".lang", t: ["English or Spanish", "Inglés o español"],
        d: ["Press EN or ES to switch the whole back office. Your choice is saved for next time.", "Presiona EN o ES para cambiar toda la oficina de idioma. Tu elección se queda guardada."] },
      { sel: "#tabBar, #sideNav", t: ["Your six pages", "Tus seis páginas"],
        d: ["Home, Bookings, Leads, Library, My card and Settings. Press any of them to jump there. A red number means something new is waiting.", "Inicio, Citas, Prospectos, Biblioteca, Mi tarjeta y Ajustes. Presiona cualquiera para ir ahí. Un número rojo quiere decir que hay algo nuevo esperándote."] },
      { sel: "#view .kpis", t: ["Your numbers at a glance", "Tus números de un vistazo"],
        d: ["New bookings waiting for you, new leads from your quiz, and what's in the team library. Press a box to open that page.", "Citas nuevas esperándote, prospectos nuevos de tu quiz y lo que hay en la biblioteca del equipo. Presiona un cuadro para abrir esa página."] },
      { sel: "#view .cardx", t: ["Latest bookings", "Últimas citas"],
        d: ["When someone books a free consultation on your card, it shows up here and the message goes to your WhatsApp too.", "Cuando alguien agenda una consulta gratis en tu tarjeta, aparece aquí y el mensaje también te llega por WhatsApp."] },
      { sel: "#view .tiles", t: ["Shortcuts", "Atajos"],
        d: ["Open the team library, edit your card, or see your card the way your customers see it.", "Abre la biblioteca del equipo, edita tu tarjeta o mira tu tarjeta como la ven tus clientes."] },
      { sel: null, t: ["Your secret door", "Tu puerta secreta"],
        d: ["To come back here anytime: open your card, press and hold your names \"Emely & Felix\" for 5 seconds, choose who you are and type your PIN. Customers never see it.",
            "Para volver aquí cuando quieras: abre tu tarjeta, mantén presionados sus nombres \"Emely & Felix\" por 5 segundos, escoge quién eres y escribe tu PIN. Los clientes nunca lo ven."] },
      { sel: "#tipsBtn", t: ["Need help again?", "¿Necesitas ayuda otra vez?"],
        d: ["Press this button anytime to replay the tips for the page you're on. Each page has its own short guide the first time you open it.",
            "Presiona este botón cuando quieras para repetir los consejos de la página donde estás. Cada página tiene su propia guía corta la primera vez que la abres."] }
    ],
    whatsnew: [
      { sel: null, t: ["New: a wellness quiz on your card", "Nuevo: un quiz de bienestar en tu tarjeta"],
        d: ["Your card now has a free 60-second quiz called \"Find your natural routine\". Visitors answer 5 quick questions (energy, sleep, body comfort, skin, weight, heart, intimacy or extra income), leave their name and WhatsApp, and get products from your catalog suggested for their goal.",
            "Tu tarjeta ahora tiene un quiz gratis de 60 segundos llamado \"Encuentra tu rutina natural\". Los visitantes contestan 5 preguntas rápidas (energía, sueño, comodidad del cuerpo, piel, peso, corazón, intimidad o ingresos extra), dejan su nombre y WhatsApp, y reciben productos de tu catálogo sugeridos para su meta."] },
      { sel: "#tabBar [data-go=leads], #sideNav [data-go=leads]", t: ["Your new Leads page", "Tu nueva página de Prospectos"],
        d: ["Everyone who finishes the quiz is saved here with their answers, so you know what they want before you write to them.", "Todos los que terminan el quiz se guardan aquí con sus respuestas, así sabes lo que buscan antes de escribirles."] },
      { sel: "#view .kpis [data-go=leads]", t: ["New leads at a glance", "Prospectos nuevos de un vistazo"],
        d: ["This box counts the leads you haven't contacted yet. Press it to open your Leads page.", "Este cuadro cuenta los prospectos que todavía no has contactado. Presiónalo para abrir tu página de Prospectos."] },
      { sel: null, t: ["What to expect", "Qué esperar"],
        d: ["At the end of the quiz, visitors can tap \"Send my results on WhatsApp\". If they do, their message reaches your WhatsApp right away. If they don't, they still show up in Leads, but you won't get a WhatsApp. So check Leads once a day and reach out first. Answer the same day while they're still interested.",
            "Al final del quiz, los visitantes pueden tocar \"Enviar mis resultados por WhatsApp\". Si lo hacen, su mensaje te llega al WhatsApp enseguida. Si no, igual aparecen en Prospectos, pero no te llega WhatsApp. Por eso revisa Prospectos una vez al día y escríbeles tú primero. Contesta el mismo día, mientras siguen interesados."] }
    ],
    leads: [
      { sel: null, t: ["Your leads", "Tus prospectos"],
        d: ["These are people who took the Natural Wellness Quiz on your card. Every one of them left their name and number and agreed to hear from you.", "Estas son personas que hicieron el Quiz de Bienestar Natural en tu tarjeta. Cada una dejó su nombre y número, y aceptó que la contactes."] },
      { sel: "#view .ld-share", t: ["Your quiz link", "Tu enlace del quiz"],
        d: ["Copy this link to share the quiz on Facebook, Instagram, your WhatsApp status or a flyer. It opens the quiz right away. Add &src=facebook (or instagram, flyer...) to the end and each lead shows where it came from.",
            "Copia este enlace para compartir el quiz en Facebook, Instagram, tu estado de WhatsApp o un flyer. Abre el quiz directo. Agrega &src=facebook (o instagram, flyer...) al final y cada prospecto te dice de dónde vino."] },
      { sel: "#view .chips", t: ["Sort your leads", "Ordena tus prospectos"],
        d: ["New: you haven't reached out yet. Contacted: you wrote to them. Customer: they bought. Joined team: they signed up with you. All: everyone.", "Nuevo: todavía no le escribes. Contactado: ya le escribiste. Cliente: ya compró. En el equipo: se unió contigo. Todos: todo el mundo."] },
      { sel: "#view .bk-item", t: ["Everything about each lead", "Todo sobre cada prospecto"],
        d: ["Their goal, how often it's on their mind, what they've tried, what matters most to them, the products the quiz suggested and where they came from. \"Interested in the team\" means they'd like to hear about the business too.",
            "Su meta, qué tan seguido piensa en eso, qué ha probado, qué le importa más, los productos que sugirió el quiz y de dónde vino. \"Le interesa el equipo\" quiere decir que también quiere saber del negocio."] },
      { sel: "#view a[data-act=ldTouch]", t: ["Message them in one tap", "Escríbeles con un toque"],
        d: ["WhatsApp, Text and Email open with a friendly message already written in their language, mentioning their goal and suggested products. Read it, change anything you like, and send. The lead moves to Contacted by itself.",
            "WhatsApp, Texto y Email abren con un mensaje amable ya escrito en su idioma, que menciona su meta y los productos sugeridos. Léelo, cambia lo que quieras y envíalo. El prospecto pasa a Contactado solo."] },
      { sel: "#view .ld-sel", t: ["Keep it up to date", "Mantenlo al día"],
        d: ["When they buy, change it to Customer. When they join your team, change it to Joined team. That way you always know who still needs a follow-up.", "Cuando compre, cámbialo a Cliente. Cuando se una a tu equipo, cámbialo a En el equipo. Así siempre sabes a quién le falta seguimiento."] },
      { sel: "#view [data-act=ldCsv]", t: ["Take your list with you", "Llévate tu lista"],
        d: ["Export CSV downloads all your leads as a spreadsheet you can open in Excel or Google Sheets.", "Exportar CSV descarga todos tus prospectos en una hoja que puedes abrir en Excel o Google Sheets."] },
      { sel: "#view .empty", t: ["No leads yet", "Todavía no hay prospectos"],
        d: ["When someone finishes the quiz, they land right here. Share your quiz link to get your first ones.", "Cuando alguien termine el quiz, aparece aquí mismo. Comparte tu enlace del quiz para conseguir los primeros."] },
      { sel: null, t: ["What to expect", "Qué esperar"],
        d: ["Some people tap \"Send my results on WhatsApp\" at the end, and that message reaches you right away. Others only show up here, with no WhatsApp. Check this page once a day, reach out first, and answer the same day. Talk about how the products fit their routine, never as a cure or medicine.",
            "Algunas personas tocan \"Enviar mis resultados por WhatsApp\" al final, y ese mensaje te llega enseguida. Otras solo aparecen aquí, sin WhatsApp. Revisa esta página una vez al día, escríbeles tú primero y contesta el mismo día. Habla de cómo los productos encajan en su rutina, nunca como cura ni medicina."] }
    ],
    bookings: [
      { sel: null, t: ["Your bookings", "Tus citas"],
        d: ["Every free consultation someone sends from your card is saved here, so nothing gets lost in your WhatsApp chats.", "Cada consulta gratis que alguien envía desde tu tarjeta se guarda aquí, así nada se pierde entre tus chats de WhatsApp."] },
      { sel: "#view .chips", t: ["Sort them", "Ordénalas"],
        d: ["New is what still needs an answer. Confirmed is set up. Done is after you met. All shows everything.", "Nuevas son las que faltan por contestar. Confirmadas ya están cuadradas. Listas son las que ya se reunieron. Todas muestra todo."] },
      { sel: "#view .bk-item", t: ["Each request", "Cada solicitud"],
        d: ["The day and time they picked, their name, topic, city and how they like to be reached.", "El día y la hora que escogieron, su nombre, el tema, la ciudad y cómo prefieren que los contacten."] },
      { sel: "#view [data-act=bkSet]", t: ["Move it along", "Avánzala"],
        d: ["After you reply on WhatsApp and set the time, press Mark confirmed. After you meet, press Mark done.", "Después de contestar por WhatsApp y cuadrar la hora, presiona Marcar confirmada. Después de reunirse, presiona Marcar lista."] },
      { sel: "#view [data-act=bkIcs]", t: ["Never forget a meeting", "Nunca olvides una cita"],
        d: ["Add to calendar puts it in your phone's calendar with the day, time and their details.", "Agregar al calendario la pone en el calendario de tu teléfono con el día, la hora y sus datos."] },
      { sel: "#view .empty", t: ["Nothing yet", "Todavía nada"],
        d: ["When the first booking comes in, it lands right here. Share your card so people can book you.", "Cuando llegue la primera cita, aparece aquí mismo. Comparte tu tarjeta para que la gente te agende."] }
    ],
    library: [
      { sel: null, t: ["Your team's library", "La biblioteca del equipo"],
        d: ["This is the team's Google Drive, right inside your back office. Same folders, same names. When the team adds something new, it shows up here by itself.",
            "Este es el Google Drive del equipo, aquí mismo en tu oficina. Las mismas carpetas, los mismos nombres. Cuando el equipo sube algo nuevo, aparece aquí solo."] },
      { sel: "#view .search", t: ["Find it fast", "Encuéntralo rápido"],
        d: ["Type a word, like \"precios\" or \"Rubi\", to find a file in the folder you're in.", "Escribe una palabra, como \"precios\" o \"Rubi\", para encontrar un archivo en la carpeta donde estás."] },
      { sel: "#view .folders", t: ["Folders", "Carpetas"],
        d: ["Press a folder to open it. The path at the top shows where you are. Press Library there to go back to the start.", "Presiona una carpeta para abrirla. La ruta de arriba te dice dónde estás. Presiona Biblioteca ahí para volver al principio."] },
      { sel: "#view .files", t: ["Files", "Archivos"],
        d: ["Press any flyer, video or PDF to open it right here. Videos play inside the page.", "Presiona cualquier flyer, video o PDF para abrirlo aquí mismo. Los videos se ven dentro de la página."] },
      { sel: null, t: ["Share with a prospect", "Compártelo con un prospecto"],
        d: ["When a file is open, use Share to send it by WhatsApp or text, Download to save it on your phone, or Open in Drive.", "Con un archivo abierto, usa Compartir para enviarlo por WhatsApp o texto, Descargar para guardarlo en tu teléfono, o Abrir en Drive."] }
    ],
    card: [
      { sel: null, t: ["Change your card yourself", "Cambia tu tarjeta tú mismo"],
        d: ["Update your photo, text, phone, catalogs and join link. Leave a box as it is to keep what's there now.", "Cambia tu foto, textos, teléfono, catálogos y enlace para unirse. Deja un campo como está para mantener lo que tiene ahora."] },
      { sel: "#view .savebar", t: ["Nothing changes until you Save", "Nada cambia hasta que guardes"],
        d: ["Edit as much as you want. Your live card only changes when you press Save changes. The button lights up when there's something to save.", "Edita todo lo que quieras. Tu tarjeta solo cambia cuando presionas Guardar cambios. El botón se activa cuando hay algo que guardar."] },
      { sel: "#view [data-up=photo]", up: true, t: ["New photo", "Foto nueva"],
        d: ["Press Upload new and pick a photo from your phone. A tall photo looks best, and we resize it for you.", "Presiona Subir nuevo y escoge una foto de tu teléfono. Una foto vertical se ve mejor, y la ajustamos por ti."] },
      { sel: "#view #f_phone", t: ["One number for everything", "Un número para todo"],
        d: ["This number is used for Call, Text, WhatsApp, orders and bookings on your card.", "Este número se usa para Llamar, Texto, WhatsApp, pedidos y citas en tu tarjeta."] },
      { sel: "#view #f_products", t: ["Your product list", "Tu lista de productos"],
        d: ["One product per line. Add, remove or reorder them however you like. This list is only what your card shows. The quiz suggestions come from your catalog, so if a product is discontinued, let Finesse Media know and we'll take it out of the quiz too.",
            "Un producto por línea. Agrega, quita o cambia el orden como quieras. Esta lista es solo lo que muestra tu tarjeta. Las sugerencias del quiz salen de tu catálogo, así que si un producto se descontinúa, avísale a Finesse Media y lo quitamos del quiz también."] },
      { sel: "#view [data-up=catalog_en]", up: true, t: ["New catalog?", "¿Catálogo nuevo?"],
        d: ["When One More sends a new catalog, upload the PDF here in English and Spanish. Your card's catalog buttons update after you Save.", "Cuando One More mande un catálogo nuevo, sube el PDF aquí en inglés y en español. Los botones del catálogo se actualizan después de guardar."] },
      { sel: "#view #edHist", t: ["Changed your mind?", "¿Cambiaste de idea?"],
        d: ["Every time you save, the version before it is kept here. Press Restore to go back to it.", "Cada vez que guardas, la versión anterior se guarda aquí. Presiona Restaurar para volver a ella."] }
    ],
    settings: [
      { sel: "#view #pinForm", t: ["Make your PIN yours", "Haz tu PIN tuyo"],
        d: ["Each of you has your own 4-number PIN. Change the temporary one here to one only you know.", "Cada uno tiene su propio PIN de 4 números. Cambia el temporal aquí por uno que solo tú sepas."] },
      { sel: "#view #tipsT", up: true, t: ["Tips on or off", "Consejos sí o no"],
        d: ["Turn these guides off when you know your way around, or show the full tour again anytime.", "Apaga estas guías cuando ya conozcas todo, o muestra el recorrido completo otra vez cuando quieras."] },
      { sel: "#view #audit", t: ["Who did what", "Quién hizo qué"],
        d: ["A simple log of who signed in, saved the card, or changed a booking or a lead.", "Un registro sencillo de quién entró, guardó la tarjeta, o cambió una cita o un prospecto."] }
    ]
  };

  var ov = null, trail = [], idx = 0, view = "", target = null;
  function visible(el) { if (!el) return false; var r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && !el.closest("[hidden]"); }
  function find(step) {
    if (!step.sel) return null;
    var els = [].slice.call(document.querySelectorAll(step.sel)).filter(visible);
    var el = els[0] || null;
    if (el && step.up) el = el.closest(".f, .row, label") || el;
    return el;
  }
  function usable(step) { return !step.sel || !!find(step); }
  function build() {
    ov = document.createElement("div"); ov.className = "tour"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = '<div class="tour-block"></div><div class="tour-spot" aria-hidden="true"></div><div class="tour-pop" tabindex="-1"></div>';
    document.body.appendChild(ov);
  }
  function start(v, force) {
    if (ov || (!force && (!isOn() || seen().indexOf(v) > -1))) return;
    var t = (TRAILS[v] || []).filter(usable);
    if (!t.length) return;
    trail = t; idx = 0; view = v; build(); show();
  }
  function show() {
    var step = trail[idx]; if (!step) return end();
    target = find(step);
    var spot = ov.querySelector(".tour-spot"), pop = ov.querySelector(".tour-pop");
    ov.classList.toggle("center", !target);
    var dots = trail.map(function (s, i) { return '<i class="' + (i === idx ? "on" : "") + '"></i>'; }).join("");
    pop.innerHTML = '<p class="tour-count">' + (idx + 1) + " / " + trail.length + '</p><h3>' + esc(T(step.t)) + '</h3><p class="tour-d">' + esc(T(step.d)) + "</p>" +
      '<div class="tour-dots" aria-hidden="true">' + dots + '</div><div class="tour-acts">' +
      (idx > 0 ? '<button type="button" class="tour-b ghost" data-tour="back">' + (es() ? "Atrás" : "Back") + "</button>" : '<button type="button" class="tour-b ghost" data-tour="skip">' + (es() ? "Saltar" : "Skip") + "</button>") +
      '<button type="button" class="tour-b" data-tour="next">' + (idx === trail.length - 1 ? (es() ? "Entendido" : "Got it") : (es() ? "Siguiente" : "Next")) + "</button></div>" +
      '<button type="button" class="tour-off" data-tour="off">' + (es() ? "Apagar los consejos" : "Turn off tips") + "</button>";
    pop.setAttribute("aria-label", T(step.t));
    if (target) {
      target.scrollIntoView({ block: "center", behavior: "auto" });
      spot.style.display = "block";
    } else spot.style.display = "none";
    place();
    pop.focus({ preventScroll: true });
  }
  function place() {
    if (!ov) return;
    var spot = ov.querySelector(".tour-spot"), pop = ov.querySelector(".tour-pop");
    var vw = window.innerWidth, vh = window.innerHeight, pw = Math.min(340, vw - 24);
    pop.style.width = pw + "px";
    if (!target) { pop.style.left = Math.round((vw - pw) / 2) + "px"; pop.style.top = Math.max(16, Math.round((vh - pop.offsetHeight) / 2)) + "px"; return; }
    var r = target.getBoundingClientRect(), pad = 6;
    var top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad), w = Math.min(vw - 8, r.width + pad * 2), h = Math.min(vh - 8, r.height + pad * 2);
    spot.style.top = top + "px"; spot.style.left = left + "px"; spot.style.width = w + "px"; spot.style.height = h + "px";
    var ph = pop.offsetHeight, below = top + h + 12, above = top - ph - 12, y;
    if (h > vh * 0.5 && left + w + pw + 28 < vw) { /* tall target with room beside it: sit to the right */
      pop.style.left = Math.round(left + w + 16) + "px"; pop.style.top = Math.round(Math.min(Math.max(16, top + 24), vh - ph - 16)) + "px"; return;
    }
    if (below + ph < vh - 8) y = below; else if (above > 8) y = above; else y = Math.max(8, vh - ph - 8);
    var x = Math.min(Math.max(12, r.left + r.width / 2 - pw / 2), vw - pw - 12);
    pop.style.top = Math.round(y) + "px"; pop.style.left = Math.round(x) + "px";
  }
  function end(off) {
    var was = view;
    if (view) markSeen(view);
    if (!off && was === "home" && seen().indexOf("whatsnew") < 0) setTimeout(function () { start("whatsnew"); }, 300);
    if (off) { store(key(), "off"); var t = document.getElementById("tipsT"); if (t) t.checked = false; if (window.cbToast) window.cbToast(es() ? "Consejos apagados. Puedes prenderlos en Ajustes." : "Tips are off. Turn them back on in Settings."); }
    if (ov) { ov.remove(); ov = null; }
    trail = []; target = null; view = "";
    var b = document.getElementById("tipsBtn"); if (b) b.focus({ preventScroll: true });
  }

  /* ? button menu */
  var menu = null;
  function openMenu() {
    if (ov) end();
    var v = (location.hash || "#home").slice(1) || "home";
    menu = document.createElement("div"); menu.className = "tour-menu-wrap";
    menu.innerHTML = '<div class="tour-menu" role="dialog" aria-modal="true" aria-label="' + (es() ? "Ayuda" : "Help") + '"><h3>' + (es() ? "¿Cómo te ayudamos?" : "How can we help?") + "</h3>" +
      '<button type="button" data-m="page">' + (es() ? "Mostrar los consejos de esta página" : "Show the tips for this page") + "</button>" +
      '<button type="button" data-m="all">' + (es() ? "Ver el recorrido completo otra vez" : "Take the full tour again") + "</button>" +
      '<button type="button" data-m="toggle">' + (isOn() ? (es() ? "Apagar los consejos" : "Turn tips off") : (es() ? "Prender los consejos" : "Turn tips on")) + "</button>" +
      '<button type="button" class="tm-x" data-m="close">' + (es() ? "Cerrar" : "Close") + "</button></div>";
    document.body.appendChild(menu);
    menu.querySelector("button").focus();
    menu.addEventListener("click", function (e) {
      var b = e.target.closest("[data-m]");
      if (!b && e.target === menu) return closeMenu();
      if (!b) return;
      var m = b.getAttribute("data-m"); closeMenu();
      if (m === "page") start(v, true);
      else if (m === "all") fullTour();
      else if (m === "toggle") { var on = !isOn(); store(key(), on ? "on" : "off"); var t = document.getElementById("tipsT"); if (t) t.checked = on; if (window.cbToast) window.cbToast(on ? (es() ? "Consejos prendidos" : "Tips are on") : (es() ? "Consejos apagados" : "Tips are off")); }
    });
  }
  function closeMenu() { if (menu) { menu.remove(); menu = null; } }
  function fullTour() {
    store(seenKey(), "[]"); store(key(), "on");
    var t = document.getElementById("tipsT"); if (t) t.checked = true;
    if ((location.hash || "#home") === "#home") start("home", true); else location.hash = "home";
  }

  document.addEventListener("cb:render", function (e) {
    var v = e.detail && e.detail.view; if (!v) return;
    setTimeout(function () {
      if (!((location.hash || "#home").slice(1).split("/")[0] === v || (v === "home" && !location.hash))) return;
      if (v === "home" && seen().indexOf("home") > -1 && seen().indexOf("whatsnew") < 0) { start("whatsnew"); return; }
      if (document.querySelector("#view > .empty .spin")) return; /* page still loading: wait for the next render */
      start(v);
    }, 450);
  });
  document.addEventListener("cb:tips-menu", openMenu);
  document.addEventListener("cb:tour", fullTour);
  document.addEventListener("cb:tips-toggle", function (e) { if (e.detail && !e.detail.on && ov) end(); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tour]"); if (!b || !ov) return;
    var a = b.getAttribute("data-tour");
    if (a === "next") { idx++; if (idx >= trail.length) end(); else show(); }
    else if (a === "back") { idx = Math.max(0, idx - 1); show(); }
    else if (a === "skip") end();
    else if (a === "off") end(true);
  });
  document.addEventListener("click", function (e) { if (ov && e.target.closest(".lang button")) setTimeout(show, 60); }, true);
  document.addEventListener("keydown", function (e) {
    if (menu && e.key === "Escape") return closeMenu();
    if (!ov) return;
    if (e.key === "Escape") end();
    else if (e.key === "ArrowRight") { idx++; if (idx >= trail.length) end(); else show(); }
    else if (e.key === "ArrowLeft" && idx > 0) { idx--; show(); }
  });
  window.addEventListener("resize", place);
  window.addEventListener("scroll", place, { passive: true });
  window.addEventListener("hashchange", function () { if (ov) end(); closeMenu(); });
})();
