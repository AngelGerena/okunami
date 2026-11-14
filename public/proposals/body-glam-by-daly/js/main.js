(function(){
  var WA = "https://wa.me/14079609004?text=";
  var SMS = "sms:+14079609004?&body=";
  var PHONE = "14073500061";
  var C_WA = "https://wa.me/" + PHONE + "?text=";
  var C_SMS = "sms:+" + PHONE + "?&body=";
  var CLIENT = "Daly (Body Glam by Daly)";

  var tabs = document.querySelectorAll(".tab");
  var cards = document.querySelectorAll(".card");
  var pick = document.getElementById("pickBtn");
  var pickSms = document.getElementById("pickSms");
  var note = document.getElementById("note");

  function show(id){
    var name = "";
    tabs.forEach(function(t){
      var on = t.dataset.look === id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if(on){ name = t.textContent; t.scrollIntoView({block:"nearest", inline:"center"}); }
    });
    cards.forEach(function(c){ c.hidden = c.id !== id; if(c.id === id) note.textContent = c.dataset.note; });
    var msg = "Hi Angel, this is Daly from Body Glam by Daly. I want the " + name + " design for my vCard.";
    pick.href = WA + encodeURIComponent(msg);
    pickSms.href = SMS + encodeURIComponent(msg);
    try{ localStorage.setItem("bgbd-look", id); }catch(e){}
  }
  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ show(t.dataset.look); window.scrollTo({top:0}); });
    t.addEventListener("keydown", function(e){
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if(!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n.dataset.look);
    });
  });
  var start = "l1";
  try{ start = localStorage.getItem("bgbd-look") || "l1"; }catch(e){}
  if(!document.getElementById(start)) start = "l1";
  show(start);

  // Get your own vCard (to Angel): always English
  var own = "Hi Angel, I really like the vCard you made for " + CLIENT + ", and I would like you to create one for me as well. Please contact me at your earliest convenience. Thank you!";
  document.querySelectorAll("[data-own]").forEach(function(a){ a.href = WA + encodeURIComponent(own); });
  document.querySelectorAll("[data-own-sms]").forEach(function(a){ a.href = SMS + encodeURIComponent(own); });

  // EN / ES per card
  function setLang(card, es){
    card.querySelectorAll("[data-es]").forEach(function(el){
      if(el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = es ? el.dataset.es : el.dataset.en;
    });
    card.dataset.lang = es ? "es" : "en";
    var b = card.querySelector("[data-lang]");
    if(b){ b.textContent = es ? "EN" : "ES"; b.setAttribute("aria-label", es ? "Switch to English / Cambiar a inglés" : "Cambiar a español / Switch to Spanish"); }
    card.querySelectorAll(".qr-hint").forEach(function(h){ h.textContent = es ? "Presiona el código para verlo en pantalla completa" : "Press the code to show it full screen"; });
  }
  cards.forEach(function(card){
    var b = card.querySelector("[data-lang]");
    if(b) b.addEventListener("click", function(){ setLang(card, card.dataset.lang !== "es"); });
  });

  // Services: Facial / Body switch
  cards.forEach(function(card){
    var segs = card.querySelectorAll(".seg-b");
    segs.forEach(function(s){
      s.addEventListener("click", function(){
        segs.forEach(function(o){ o.setAttribute("aria-selected", o === s ? "true" : "false"); });
        card.querySelectorAll("[data-pane]").forEach(function(p){ p.hidden = p.dataset.pane !== s.dataset.seg; });
      });
    });
  });

  // Toast
  function toast(msg){
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role","status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2200);
  }

  // Zelle: copy email + full screen code
  document.querySelectorAll("[data-copy]").forEach(function(b){
    b.addEventListener("click", function(){
      var es = b.closest(".card").dataset.lang === "es", v = b.dataset.copy;
      function ok(){ toast(es ? "Email copiado" : "Email copied"); }
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(v).then(ok, function(){ fallback(); }); } else fallback();
      function fallback(){ var i = document.createElement("textarea"); i.value = v; document.body.appendChild(i); i.select(); try{ document.execCommand("copy"); ok(); }catch(e){} i.remove(); }
    });
  });
  var zf = document.getElementById("zfull"), zLast = null;
  function zClose(){ zf.hidden = true; document.body.style.overflow = ""; if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){}); if(zLast) zLast.focus(); }
  document.querySelectorAll("[data-zelle]").forEach(function(b){
    b.addEventListener("click", function(){
      zLast = b; zf.hidden = false; document.body.style.overflow = "hidden"; zf.querySelector(".qr-x").focus();
      if(zf.requestFullscreen) zf.requestFullscreen().catch(function(){});
    });
  });
  zf.querySelector("[data-z-close]").addEventListener("click", zClose);
  zf.addEventListener("click", function(e){ if(e.target === zf || e.target.tagName === "IMG") zClose(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !zf.hidden) zClose(); });
  document.addEventListener("fullscreenchange", function(){ if(!document.fullscreenElement && !zf.hidden) zClose(); });

  // Booking pop-up (requests go to Daly)
  var bk = document.getElementById("bk"), lastBtn = null, es = false;
  var T = {
    en:{kicker:"Book with Daly", title:"Request an appointment", vag:"Want it instantly? Book on Vagaro",
      s1:"1. Pick the day", s2:"2. Pick the time", s3:"3. Your treatment", fName:"Your name", fVisit:"Visit",
      sms:"Text", close:"Close", prev:"Previous month", next:"Next month",
      fine:"Your request goes to Daly. She confirms every appointment personally.",
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      types:["Facial","Anti-aging","Acne facial","Body sculpting","Wood therapy","Sauna blanket / Detox","Consultation","Not sure yet"],
      visits:["First visit","Returning client","Package session"], pick:"Pick a day and a time to send your request.", at:"at", none:"To be confirmed"},
    es:{kicker:"Reserva con Daly", title:"Solicita una cita", vag:"¿La quieres al instante? Reserva en Vagaro",
      s1:"1. Elige el día", s2:"2. Elige la hora", s3:"3. Tu tratamiento", fName:"Tu nombre", fVisit:"Visita",
      sms:"Texto", close:"Cerrar", prev:"Mes anterior", next:"Mes siguiente",
      fine:"Tu solicitud le llega a Daly. Ella confirma cada cita personalmente.",
      months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dow:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], days:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
      types:["Facial","Antienvejecimiento","Facial para acné","Moldeo corporal","Maderoterapia","Manta sauna / Detox","Consulta","Aún no sé"],
      visits:["Primera visita","Clienta frecuente","Sesión de paquete"], pick:"Elige un día y una hora para enviar tu solicitud.", at:"a las", none:"Por confirmar"}
  };
  var HOURS = [9,10,11,12,13,14,15,16,17,18];
  function ampm(h){ return (h % 12 || 12) + ":00 " + (h < 12 ? "AM" : "PM"); }
  var today = new Date(); today.setHours(0,0,0,0);
  var minDay = new Date(today); minDay.setDate(minDay.getDate()+1);
  var view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  var maxView = new Date(today.getFullYear()+1, today.getMonth(), 1);
  var sel = {date:null, hour:null, type:null};
  var calGrid = document.getElementById("calGrid"), calMonth = document.getElementById("calMonth");
  var prevB = document.getElementById("calPrev"), nextB = document.getElementById("calNext");
  function L(){ return T[es ? "es" : "en"]; }

  function drawCal(){
    var t = L();
    calMonth.textContent = t.months[view.getMonth()] + " " + view.getFullYear();
    document.getElementById("calDow").innerHTML = t.dow.map(function(d){ return "<span>"+d+"</span>"; }).join("");
    calGrid.innerHTML = "";
    for(var i=0;i<view.getDay();i++) calGrid.appendChild(document.createElement("span"));
    var dim = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
    for(var d=1; d<=dim; d++){
      var dt = new Date(view.getFullYear(), view.getMonth(), d), b = document.createElement("button");
      b.type = "button"; b.className = "day"; b.textContent = d;
      b.setAttribute("aria-label", t.days[dt.getDay()] + " " + d + " " + t.months[dt.getMonth()]);
      if(dt < minDay) b.disabled = true;
      if(+dt === +today) b.classList.add("today");
      b.setAttribute("aria-pressed", sel.date && +sel.date === +dt ? "true" : "false");
      (function(dt){ b.addEventListener("click", function(){ sel.date = dt; drawCal(); update(); }); })(dt);
      calGrid.appendChild(b);
    }
    prevB.disabled = view <= new Date(minDay.getFullYear(), minDay.getMonth(), 1);
    nextB.disabled = view >= maxView;
  }
  prevB.addEventListener("click", function(){ view.setMonth(view.getMonth()-1); drawCal(); });
  nextB.addEventListener("click", function(){ view.setMonth(view.getMonth()+1); drawCal(); });

  function drawChips(){
    var t = L(), slots = document.getElementById("slots"), types = document.getElementById("evType"), vis = document.getElementById("bkVisit");
    slots.innerHTML = ""; types.innerHTML = "";
    HOURS.forEach(function(h){
      var b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.textContent = ampm(h);
      b.setAttribute("aria-pressed", sel.hour === h ? "true" : "false");
      b.addEventListener("click", function(){ sel.hour = h; drawChips(); update(); });
      slots.appendChild(b);
    });
    t.types.forEach(function(n, i){
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = n;
      b.setAttribute("aria-pressed", sel.type === i ? "true" : "false");
      b.addEventListener("click", function(){ sel.type = sel.type === i ? null : i; drawChips(); update(); });
      types.appendChild(b);
    });
    var keep = vis.selectedIndex;
    vis.innerHTML = "<option value=''>—</option>" + t.visits.map(function(s){ return "<option>"+s+"</option>"; }).join("");
    vis.selectedIndex = keep > 0 ? keep : 0;
  }
  function dateText(){
    var t = L(), d = sel.date;
    return es ? t.days[d.getDay()] + ", " + d.getDate() + " de " + t.months[d.getMonth()] + " de " + d.getFullYear()
              : t.days[d.getDay()] + ", " + t.months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }
  function update(){
    var t = L(), ok = sel.date && sel.hour !== null;
    var sum = document.getElementById("bkSum"), wa = document.getElementById("bkWa"), sms = document.getElementById("bkSms");
    if(!ok){
      sum.textContent = t.pick;
      wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true");
      wa.href = "https://wa.me/" + PHONE; sms.href = "sms:+" + PHONE; return;
    }
    sum.innerHTML = "<b>" + dateText() + "</b> " + t.at + " <b>" + ampm(sel.hour) + "</b>";
    var name = document.getElementById("bkName").value.trim();
    var vEl = document.getElementById("bkVisit"), visit = vEl.selectedIndex > 0 ? vEl.value : "";
    var type = sel.type === null ? "" : t.types[sel.type];
    var msg = es
      ? "Hola Daly" + (name ? ", soy " + name : "") + ". Quisiera solicitar una cita en Body Glam by Daly.\nFecha: " + dateText() + "\nHora: " + ampm(sel.hour) +
        "\nTratamiento: " + (type || t.none) + "\nVisita: " + (visit || t.none)
      : "Hi Daly" + (name ? ", this is " + name : "") + ". I'd like to request an appointment at Body Glam by Daly.\nDate: " + dateText() + "\nTime: " + ampm(sel.hour) +
        "\nTreatment: " + (type || t.none) + "\nVisit: " + (visit || t.none);
    wa.href = C_WA + encodeURIComponent(msg); sms.href = C_SMS + encodeURIComponent(msg);
    wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
  }
  document.getElementById("bkName").addEventListener("input", update);
  document.getElementById("bkVisit").addEventListener("change", update);

  var VARS = ["--bg","--bg2","--ink","--muted","--accent","--on","--panel","--line","--fd","--fb"];
  function openBk(btn){
    lastBtn = btn; var card = btn.closest(".card");
    es = card && card.dataset.lang === "es";
    var cs = getComputedStyle(card);
    VARS.forEach(function(v){ bk.style.setProperty(v, cs.getPropertyValue(v)); });
    sel = {date:null, hour:null, type:null};
    document.getElementById("bkName").value = ""; document.getElementById("bkVisit").selectedIndex = 0;
    view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
    var t = L();
    bk.querySelectorAll("[data-i18n]").forEach(function(el){ el.textContent = t[el.dataset.i18n]; });
    bk.querySelector(".bk-x").setAttribute("aria-label", t.close);
    prevB.setAttribute("aria-label", t.prev); nextB.setAttribute("aria-label", t.next);
    drawCal(); drawChips(); update();
    bk.hidden = false; document.body.classList.add("bk-open");
    bk.querySelector(".bk-sheet").scrollTop = 0;
    bk.querySelector(".bk-x").focus();
  }
  function closeBk(){
    bk.hidden = true; document.body.classList.remove("bk-open");
    if(lastBtn) lastBtn.focus();
  }
  document.querySelectorAll("[data-book]").forEach(function(b){ b.addEventListener("click", function(){ openBk(b); }); });
  bk.querySelector("[data-bk-close]").addEventListener("click", closeBk);
  bk.addEventListener("click", function(e){ if(e.target === bk) closeBk(); });
  document.addEventListener("keydown", function(e){
    if(bk.hidden) return;
    if(e.key === "Escape") closeBk();
    if(e.key === "Tab"){
      var f = [].slice.call(bk.querySelectorAll("button:not([disabled]),a:not([aria-disabled]),input,select")).filter(function(x){ return x.offsetParent; });
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
    }
  });

  // Save Contact (logo as the contact photo when it loads)
  var base = ["BEGIN:VCARD","VERSION:3.0","N:;Daly;;;","FN:Daly - Body Glam by Daly",
    "ORG:Body Glam by Daly LLC",
    "TITLE:Licensed Esthetician & Body Sculpting",
    "TEL;TYPE=CELL,VOICE:+" + PHONE,
    "EMAIL;TYPE=INTERNET:bodyglambydaly@gmail.com",
    "ADR;TYPE=WORK:;Unit 12;577 Deltona Blvd;Deltona;FL;32725;USA",
    "URL:https://okunami.pro/proposals/body-glam-by-daly/",
    "item1.URL:https://www.vagaro.com/bodyglambydaly","item1.X-ABLabel:Book on Vagaro",
    "item2.URL:https://www.instagram.com/bodyglamby_daly","item2.X-ABLabel:Instagram",
    "NOTE:Luxury skincare and body sculpting in a private suite inside Jahileen's Nails & Beauty Studio. Book on Vagaro. Zelle: Body Glam by Daly LLC (bodyglambydaly@gmail.com)."];
  var photo = "";
  fetch("images/apple-touch-icon.png").then(function(r){ return r.blob(); }).then(function(b){
    var fr = new FileReader(); fr.onload = function(){ photo = String(fr.result).split(",")[1] || ""; }; fr.readAsDataURL(b);
  }).catch(function(){});
  function vcf(){
    var lines = base.slice();
    if(photo) lines.push("PHOTO;ENCODING=b;TYPE=PNG:" + photo);
    lines.push("END:VCARD"); return lines.join("\r\n");
  }
  document.querySelectorAll("[data-save]").forEach(function(b){
    b.addEventListener("click", function(){
      var url = URL.createObjectURL(new Blob([vcf()], {type:"text/vcard;charset=utf-8"}));
      var a = document.createElement("a"); a.href = url; a.download = "Body-Glam-by-Daly.vcf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    });
  });
})();
