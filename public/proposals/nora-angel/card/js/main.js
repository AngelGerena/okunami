(function(){
  var WA = "https://wa.me/14079609004?text=";
  var SMS = "sms:+14079609004?&body=";
  // Their number can be changed in the back office (content.js sets body[data-phone])
  function fxNum(){ return document.body.dataset.phone || "14077310427"; }
  var FX = { get wa(){ return "https://wa.me/" + fxNum() + "?text="; }, get sms(){ return "sms:+" + fxNum() + "?&body="; } };

  // Final card: a single look, no picker
  // Get your own vCard (to Angel). Stays in English in every language.
  var own = "Hi Angel, I really like your U-MUVO vCard, and I would like you to create one for me as well. Please contact me at your earliest convenience. Thank you!";
  document.querySelectorAll("[data-own]").forEach(function(a){ a.href = WA + encodeURIComponent(own); });
  document.querySelectorAll("[data-own-sms]").forEach(function(a){ a.href = SMS + encodeURIComponent(own); });

  // EN / ES switch per card (English first)
  function setLang(card, es){
    card.querySelectorAll("[data-es]").forEach(function(el){
      if(el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = es ? el.dataset.es : el.dataset.en;
    });
    card.querySelectorAll("img[data-es-src]").forEach(function(img){
      if(!img.dataset.enSrc) img.dataset.enSrc = img.getAttribute("src");
      img.src = es ? img.dataset.esSrc : img.dataset.enSrc;
    });
    card.querySelectorAll("[data-cat]").forEach(function(a){ a.href = es ? (a.dataset.esHref || "files/catalog-es.pdf") : (a.dataset.enHref || "files/catalog-en.pdf"); });
    card.querySelectorAll("[data-order]").forEach(function(o){ o.href = FX.wa + encodeURIComponent(es ? ORDER_ES : ORDER_EN); });
    card.dataset.lang = es ? "es" : "en";
    card.setAttribute("lang", es ? "es" : "en");
    var b = card.querySelector("[data-lang]");
    if(b){ b.setAttribute("aria-checked", es ? "true" : "false"); b.setAttribute("aria-label", es ? "English / Inglés" : "Español / Spanish"); }
  }
  var ORDER_EN = "Hi Angel and Nora, I saw your U-MUVO catalog and I'd like to place an order.";
  var ORDER_ES = "Hola Angel y Nora, vi su cat\u00e1logo de U-MUVO y me gustar\u00eda hacer un pedido.";
  document.querySelectorAll("[data-order]").forEach(function(o){ o.href = FX.wa + encodeURIComponent(ORDER_EN); });
  document.querySelectorAll(".card").forEach(function(card){
    var b = card.querySelector("[data-lang]");
    if(b) b.addEventListener("click", function(){ setLang(card, card.dataset.lang !== "es"); });
  });
  // Spanish hint under each QR (the shared kit adds the English one)
  window.addEventListener("load", function(){
    document.querySelectorAll(".qr-hint").forEach(function(h){
      h.dataset.es = "Presiona el c&oacute;digo para verlo en pantalla completa";
      var card = h.closest(".card");
      if(card && card.dataset.lang === "es"){ h.dataset.en = h.innerHTML; h.innerHTML = h.dataset.es; }
    });
  });

  // Booking pop-up (messages go to Angel or Nora, visitor picks): calendar, AM/PM slots, details
  var bk = document.getElementById("bk"), lastBtn = null, bkEs = false;
  var T = {
    en:{kicker:"Angel & Nora · U-MUVO", title:"Book a free consultation", s1:"1. Pick the day", s2:"2. Pick the time", s3:"3. What can we help you with?",
      fName:"Your name", fCity:"City", fSize:"Best way to reach you", sms:"Text", close:"Close", prev:"Previous month", next:"Next month",
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      types:["Product info","Place an order","Join the team","Business presentation","Video call"],
      sizes:["Phone call","Text message","WhatsApp","Email"], pick:"Pick a day and a time to send your request.",
      at:"at", none:"To be confirmed"},
    es:{kicker:"Angel & Nora · U-MUVO", title:"Agenda una consulta gratis", s1:"1. Elige el día", s2:"2. Elige la hora", s3:"3. ¿En qué te podemos ayudar?",
      fName:"Tu nombre", fCity:"Ciudad", fSize:"Mejor forma de contactarte", sms:"Texto", close:"Cerrar", prev:"Mes anterior", next:"Mes siguiente",
      months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dow:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], days:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
      types:["Info de productos","Hacer un pedido","Unirme al equipo","Presentación de negocio","Videollamada"],
      sizes:["Llamada","Mensaje de texto","WhatsApp","Email"], pick:"Elige un día y una hora para enviar tu solicitud.",
      at:"a las", none:"Por confirmar"}
  };
  var HOURS = [9,10,11,12,13,14,15,16,17,18,19,20];
  function ampm(h){ var hh = h % 12 || 12; return hh + ":00 " + (h < 12 ? "AM" : "PM"); }
  var today = new Date(); today.setHours(0,0,0,0);
  var minDay = new Date(today); minDay.setDate(minDay.getDate()+1);
  var view = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  var maxView = new Date(today.getFullYear()+1, today.getMonth(), 1);
  var sel = {date:null, hour:null, type:null};
  var calGrid = document.getElementById("calGrid"), calMonth = document.getElementById("calMonth");
  var prevB = document.getElementById("calPrev"), nextB = document.getElementById("calNext");
  function L(){ return T[bkEs ? "es" : "en"]; }
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
    return bkEs ? t.days[d.getDay()] + ", " + d.getDate() + " de " + t.months[d.getMonth()] + " de " + d.getFullYear()
                : t.days[d.getDay()] + ", " + t.months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }
  function update(){
    var t = L(), ok = sel.date && sel.hour !== null;
    var sum = document.getElementById("bkSum"), wa = document.getElementById("bkWa"), sms = document.getElementById("bkSms");
    if(!ok){
      sum.textContent = t.pick;
      wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true");
      wa.href = "https://wa.me/" + fxNum(); sms.href = "sms:+" + fxNum(); lastBooking = null; return;
    }
    sum.innerHTML = "<b>" + dateText() + "</b> " + t.at + " <b>" + ampm(sel.hour) + "</b>";
    var name = document.getElementById("bkName").value.trim(), city = document.getElementById("bkCity").value.trim();
    var sizeEl = document.getElementById("bkSize"), how = sizeEl.selectedIndex > 0 ? sizeEl.value : "";
    var type = sel.type === null ? "" : t.types[sel.type];
    var msg = bkEs
      ? "Hola Angel y Nora" + (name ? ", soy " + name : "") + ". Me gustaría agendar una consulta gratis de U-MUVO.\nFecha: " + dateText() + "\nHora: " + ampm(sel.hour) +
        "\nTema: " + (type || t.none) + "\nCiudad: " + (city || t.none) + "\nMejor forma de contactarme: " + (how || t.none)
      : "Hi Angel and Nora" + (name ? ", this is " + name : "") + ". I'd like to book a free U-MUVO consultation.\nDate: " + dateText() + "\nTime: " + ampm(sel.hour) +
        "\nTopic: " + (type || t.none) + "\nCity: " + (city || t.none) + "\nBest way to reach me: " + (how || t.none);
    wa.href = FX.wa + encodeURIComponent(msg); sms.href = FX.sms + encodeURIComponent(msg);
    var dd = sel.date;
    lastBooking = { day: dd.getFullYear() + "-" + String(dd.getMonth()+1).padStart(2,"0") + "-" + String(dd.getDate()).padStart(2,"0"),
      time: ampm(sel.hour), type: type, name: name, city: city, how: how, lang: bkEs ? "es" : "en", message: msg };
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
  // Log each sent booking once for the back office (Bookings)
  var lastBooking = null, logged = false;
  ["bkWa","bkSms"].forEach(function(id){
    document.getElementById(id).addEventListener("click", function(){
      if(!lastBooking || logged || !window.cbLogBooking) return;
      logged = true; lastBooking.channel = id === "bkWa" ? "whatsapp" : "text"; window.cbLogBooking(lastBooking);
    });
  });
  function openBk(btn){
    logged = false;
    lastBtn = btn; var card = btn.closest(".card"); bkEs = !!card && card.dataset.lang === "es";
    bk.className = "bk " + (card ? card.id : "");
    sel = {date:null, hour:null, type:null};
    document.getElementById("bkName").value = ""; document.getElementById("bkCity").value = "";
    document.getElementById("bkSize").selectedIndex = 0;
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

  // Save Contact
  function vcfText(){
    var d = window.CB_CONTENT || {}, nm = (d.name || "Angel & Nora"), em = document.body.dataset.email || "angel@finessemedia.pro";
    return ["BEGIN:VCARD","VERSION:3.0","N:;" + nm + ";;;","FN:" + nm,
    "ORG:" + (d.company || "U-MUVO · One More International"),
    "TITLE:" + (d.role_en || "Independent Distributors"),
    "item1.TEL;TYPE=CELL,VOICE:+" + (document.body.dataset.phone2 || "14079609004"), "item1.X-ABLabel:Angel",
    "item2.TEL;TYPE=CELL,VOICE:+" + fxNum(), "item2.X-ABLabel:Nora",
    "X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/" + fxNum(),
    "EMAIL;TYPE=INTERNET:" + em,
    "URL:https://noraangel.okunami.pro/",
    "NOTE:U-MUVO wellness products and business opportunity. Order and questions by WhatsApp.",
    "END:VCARD"].join("\r\n");
  }
  document.querySelectorAll("[data-save]").forEach(function(b){
    b.addEventListener("click", function(){
      var url = URL.createObjectURL(new Blob([vcfText()], {type:"text/vcard;charset=utf-8"}));
      var a = document.createElement("a"); a.href = url; a.download = "Angel-and-Nora.vcf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    });
  });
})();
