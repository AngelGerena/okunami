(function(){
  var WA = "https://wa.me/14079609004?text=";
  var SMS = "sms:+14079609004?&body=";
  var MAYRA_WA = "https://wa.me/17874528141?text=";
  var MAYRA_SMS = "sms:+17874528141?&body=";

  var names = {l1:"Portada", l2:"Contraportada", l3:"Editorial", l4:"Rosa & Negro", l5:"Firma", l6:"Hoja de Contacto"};
  var notes = {
    l1: "Portada de revista: tu foto editorial en blanco y negro con la franja rosa de tu libro. Elegante y directa.",
    l2: "La contraportada de tu libro hecha tarjeta: tu mensaje, tu lema y tu logo en la franja negra.",
    l3: "Tu foto en blanco y negro a página completa, con tu nombre grande como en una revista.",
    l4: "Bloque rosa y negro del libro, con tu nombre en letras grandes y tu foto fundida en el rosa.",
    l5: "Una foto enmarcada con tu firma encima y una sombra rosa. Personal y elegante.",
    l6: "Una tira de película de fotógrafo con tu mejor toma marcada en rosa. Moderna y creativa."
  };

  var tabs = document.querySelectorAll(".tab");
  var pick = document.getElementById("pickBtn");
  var pickSms = document.getElementById("pickSms");
  var note = document.getElementById("note");

  function show(id){
    tabs.forEach(function(t){ t.setAttribute("aria-selected", t.dataset.look === id ? "true" : "false"); });
    document.querySelectorAll(".card").forEach(function(c){ c.hidden = c.id !== id; });
    note.textContent = notes[id];
    var msg = "Hola Angel, soy Mayra Soto. Quiero el diseño " + names[id] + " para mi vCard de Life & Business.";
    pick.href = WA + encodeURIComponent(msg);
    pickSms.href = SMS + encodeURIComponent(msg);
    try{ localStorage.setItem("ms-look", id); }catch(e){}
  }
  tabs.forEach(function(t){
    t.addEventListener("click", function(){ show(t.dataset.look); window.scrollTo({top:0}); });
  });
  var start = "l1";
  try{ start = localStorage.getItem("ms-look") || "l1"; }catch(e){}
  if(!names[start]) start = "l1";
  show(start);

  // Get your own vCard (to Angel), message stays in English on every language
  var own = "Hi Angel, I really like the vCard you made for Mayra Soto, and I would like you to create one for me as well. Please contact me at your earliest convenience. Thank you!";
  document.querySelectorAll("[data-own]").forEach(function(a){ a.href = WA + encodeURIComponent(own); });
  document.querySelectorAll("[data-own-sms]").forEach(function(a){ a.href = SMS + encodeURIComponent(own); });

  // Booking pop-up (to Mayra): calendar, AM/PM time slots, event details
  var bk = document.getElementById("bk"), lastBtn = null, bkEn = false;
  var T = {
    es:{kicker:"Contrata a Mayra Soto", title:"Solicita una fecha", s1:"1. Elige el día", s2:"2. Elige la hora", s3:"3. Cuéntale del evento",
      fName:"Tu nombre", fCity:"Ciudad", fSize:"Cantidad de personas", sms:"Texto", close:"Cerrar", prev:"Mes anterior", next:"Mes siguiente",
      months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dow:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], days:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
      types:["Conferencia","Empresa","Iglesia","Evento de mujeres","Taller","Virtual"],
      sizes:["Menos de 50","50 a 150","150 a 500","Más de 500"], pick:"Elige un día y una hora para enviar tu solicitud.",
      at:"a las", none:"Por confirmar"},
    en:{kicker:"Book Mayra Soto", title:"Request a date", s1:"1. Pick the day", s2:"2. Pick the time", s3:"3. Tell her about the event",
      fName:"Your name", fCity:"City", fSize:"Audience size", sms:"Text", close:"Close", prev:"Previous month", next:"Next month",
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      types:["Conference","Company","Church","Women's event","Workshop","Virtual"],
      sizes:["Under 50","50 to 150","150 to 500","Over 500"], pick:"Pick a day and a time to send your request.",
      at:"at", none:"To be confirmed"}
  };
  var HOURS = [8,9,10,11,12,13,14,15,16,17,18,19];
  function ampm(h){ var hh = h % 12 || 12; return hh + ":00 " + (h < 12 ? "AM" : "PM"); }
  var today = new Date(); today.setHours(0,0,0,0);
  var minDay = new Date(today); minDay.setDate(minDay.getDate()+1);
  var view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  var maxView = new Date(today.getFullYear()+1, today.getMonth(), 1);
  var sel = {date:null, hour:null, type:null};
  var calGrid = document.getElementById("calGrid"), calMonth = document.getElementById("calMonth");
  var prevB = document.getElementById("calPrev"), nextB = document.getElementById("calNext");

  function L(){ return T[bkEn ? "en" : "es"]; }
  function drawCal(){
    var t = L();
    calMonth.textContent = t.months[view.getMonth()] + " " + view.getFullYear();
    document.getElementById("calDow").innerHTML = t.dow.map(function(d){ return "<span>"+d+"</span>"; }).join("");
    calGrid.innerHTML = "";
    var lead = view.getDay(), dim = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
    for(var i=0;i<lead;i++) calGrid.appendChild(document.createElement("span"));
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
    var t = L(), slots = document.getElementById("slots"), types = document.getElementById("evType"), size = document.getElementById("bkSize");
    slots.innerHTML = ""; types.innerHTML = "";
    HOURS.forEach(function(h){
      var b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.textContent = ampm(h);
      b.setAttribute("aria-pressed", sel.hour === h ? "true" : "false");
      b.addEventListener("click", function(){ sel.hour = h; drawChips(); update(); });
      slots.appendChild(b);
    });
    t.types.forEach(function(name, i){
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = name;
      b.setAttribute("aria-pressed", sel.type === i ? "true" : "false");
      b.addEventListener("click", function(){ sel.type = sel.type === i ? null : i; drawChips(); update(); });
      types.appendChild(b);
    });
    var keep = size.selectedIndex;
    size.innerHTML = "<option value=''>—</option>" + t.sizes.map(function(s){ return "<option>"+s+"</option>"; }).join("");
    size.selectedIndex = keep > 0 ? keep : 0;
  }
  function dateText(){
    var t = L(), d = sel.date;
    return bkEn ? t.days[d.getDay()] + ", " + t.months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
                : t.days[d.getDay()] + ", " + d.getDate() + " de " + t.months[d.getMonth()] + " de " + d.getFullYear();
  }
  function update(){
    var t = L(), ok = sel.date && sel.hour !== null;
    var sum = document.getElementById("bkSum"), wa = document.getElementById("bkWa"), sms = document.getElementById("bkSms");
    if(!ok){
      sum.textContent = t.pick;
      wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true");
      wa.href = "https://wa.me/17874528141"; sms.href = "sms:+17874528141"; return;
    }
    sum.innerHTML = "<b>" + dateText() + "</b> " + t.at + " <b>" + ampm(sel.hour) + "</b>";
    var name = document.getElementById("bkName").value.trim(), city = document.getElementById("bkCity").value.trim();
    var sizeEl = document.getElementById("bkSize"), size = sizeEl.selectedIndex > 0 ? sizeEl.value : "";
    var type = sel.type === null ? "" : t.types[sel.type];
    var msg = bkEn
      ? "Hi Mayra" + (name ? ", this is " + name : "") + ". I'd like to book you for an event.\nDate: " + dateText() + "\nTime: " + ampm(sel.hour) +
        "\nEvent type: " + (type || t.none) + "\nCity: " + (city || t.none) + "\nAudience size: " + (size || t.none)
      : "Hola Mayra" + (name ? ", soy " + name : "") + ". Me gustaría contratarte para un evento.\nFecha: " + dateText() + "\nHora: " + ampm(sel.hour) +
        "\nTipo de evento: " + (type || t.none) + "\nCiudad: " + (city || t.none) + "\nCantidad de personas: " + (size || t.none);
    wa.href = MAYRA_WA + encodeURIComponent(msg); sms.href = MAYRA_SMS + encodeURIComponent(msg);
    wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
  }
  ["bkName","bkCity","bkSize"].forEach(function(id){
    document.getElementById(id).addEventListener("input", update);
    document.getElementById(id).addEventListener("change", update);
  });
  function translate(){
    var t = L();
    bk.querySelectorAll("[data-i18n]").forEach(function(el){ el.textContent = t[el.dataset.i18n]; });
    bk.querySelector(".bk-x").setAttribute("aria-label", t.close);
    prevB.setAttribute("aria-label", t.prev); nextB.setAttribute("aria-label", t.next);
  }
  function openBk(btn){
    lastBtn = btn; var card = btn.closest(".card"); bkEn = card && card.dataset.lang === "en";
    sel = {date:null, hour:null, type:null};
    view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
    translate(); drawCal(); drawChips(); update();
    bk.hidden = false; document.body.classList.add("bk-open");
    bk.querySelector(".bk-x").focus();
  }
  function closeBk(){
    bk.hidden = true; document.body.classList.remove("bk-open");
    if(lastBtn) lastBtn.focus();
  }
  document.querySelectorAll("[data-hire]").forEach(function(b){ b.addEventListener("click", function(){ openBk(b); }); });
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
  // EN / ES switch per card
  function setLang(card, en){
    card.querySelectorAll("[data-en]").forEach(function(el){
      if(el.dataset.es === undefined) el.dataset.es = el.textContent;
      el.textContent = en ? el.dataset.en : el.dataset.es;
    });
    card.dataset.lang = en ? "en" : "es";
    var b = card.querySelector("[data-lang]");
    if(b) b.textContent = en ? "ES" : "EN";
  }
  document.querySelectorAll(".card").forEach(function(card){
    var b = card.querySelector("[data-lang]");
    if(b) b.addEventListener("click", function(){ setLang(card, card.dataset.lang !== "en"); });
  });

  // Spanish hint under each QR (the shared kit adds it in English after this script runs)
  window.addEventListener("load", function(){
    document.querySelectorAll(".card").forEach(function(card){
      card.querySelectorAll(".qr-hint").forEach(function(h){
        h.dataset.en = h.textContent; h.dataset.es = "Presiona el código para verlo en pantalla completa";
        h.textContent = card.dataset.lang === "en" ? h.dataset.en : h.dataset.es;
      });
    });
  });

  // Save Contact
  var vcf = ["BEGIN:VCARD","VERSION:3.0","N:Soto;Mayra;;;","FN:Mayra Soto",
    "ORG:Mayra Soto Life & Business",
    "TITLE:Conferencista · Life Coach · Autora · Presentadora de TV",
    "TEL;TYPE=CELL,VOICE:+17874528141",
    "URL:https://okunami.pro/proposals/mayra-soto/",
    "NOTE:Autora de Todo & Nada: Eleva tu Vida. Positivismo = Posibilidades.",
    "END:VCARD"].join("\r\n");
  document.querySelectorAll("[data-save]").forEach(function(b){
    b.addEventListener("click", function(){
      var url = URL.createObjectURL(new Blob([vcf], {type:"text/vcard;charset=utf-8"}));
      var a = document.createElement("a"); a.href = url; a.download = "Mayra-Soto.vcf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    });
  });
})();
