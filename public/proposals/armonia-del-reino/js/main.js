(function(){
  var WA = "https://wa.me/14079609004?text=";
  var SMS = "sms:+14079609004?&body=";
  var NORA_WA = "https://wa.me/14077310427";
  var NORA_SMS = "sms:+14077310427";

  var names = {l1:"Corona", l2:"Púrpura Real", l3:"Pergamino", l4:"Escenario", l5:"Cristal", l6:"Vinilo", l7:"Amanecer"};
  var notes = {
    l1: "El escenario de tu banner: luces doradas, tu logo en oro y tu foto al frente. Lujo y presencia.",
    l2: "Púrpura real con el aro dorado de tu logo como un halo detrás de ti. Elegante y de reino.",
    l3: "Papel de partitura color marfil con tu foto en un arco. La única versión clara: limpia y delicada.",
    l4: "Póster de concierto: un reflector sobre ti y tu nombre en letras grandes. Para eventos y giras.",
    l5: "Cristal líquido sobre una aurora púrpura y dorada. Moderna, suave y luminosa.",
    l6: "Tu tarjeta como un disco de vinilo, con tus botones como lista de canciones. Creativa y musical.",
    l7: "Un amanecer de adoración con rayos de luz detrás de ti y botones fijos abajo para contactarte rápido."
  };

  var tabs = document.querySelectorAll(".tab");
  var pick = document.getElementById("pickBtn");
  var pickSms = document.getElementById("pickSms");
  var note = document.getElementById("note");
  var bk = document.getElementById("bk");

  function show(id){
    tabs.forEach(function(t){ t.setAttribute("aria-selected", t.dataset.look === id ? "true" : "false"); });
    document.querySelectorAll(".card").forEach(function(c){ c.hidden = c.id !== id; });
    note.textContent = notes[id];
    bk.dataset.theme = id;
    document.body.dataset.look = id;
    var msg = "Hola Angel, soy Nora Ivelisse. Quiero el diseño " + names[id] + " para mi vCard de Armonía del Reino.";
    pick.href = WA + encodeURIComponent(msg);
    pickSms.href = SMS + encodeURIComponent(msg);
    try{ localStorage.setItem("adr-look", id); }catch(e){}
  }
  tabs.forEach(function(t){
    t.addEventListener("click", function(){ show(t.dataset.look); window.scrollTo({top:0}); });
  });
  var start = "l1";
  try{ start = localStorage.getItem("adr-look") || "l1"; }catch(e){}
  if(!names[start]) start = "l1";
  show(start);

  // Get your own vCard (to Angel); message stays in English in every language
  var own = "Hi Angel, I really like the vCard you made for Nora Ivelisse, and I would like you to create one for me as well. Please contact me at your earliest convenience. Thank you!";
  document.querySelectorAll("[data-own]").forEach(function(a){ a.href = WA + encodeURIComponent(own); });
  document.querySelectorAll("[data-own-sms]").forEach(function(a){ a.href = SMS + encodeURIComponent(own); });

  // Booking pop-up (to Nora): calendar, AM/PM time slots, event details
  var lastBtn = null, bkEn = false;
  var T = {
    es:{kicker:"Invita a Nora Ivelisse", title:"Solicita una fecha", s1:"1. Elige el día", s2:"2. Elige la hora", s3:"3. Cuéntame del evento",
      fName:"Tu nombre", fCity:"Ciudad", fChurch:"Iglesia u organización", fSize:"Cantidad de personas", sms:"Texto", close:"Cerrar", prev:"Mes anterior", next:"Mes siguiente",
      months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dow:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], days:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
      types:["Culto","Concierto","Conferencia","Retiro","Evento especial"],
      sizes:["Menos de 50","50 a 150","150 a 500","Más de 500"], pick:"Elige un día y una hora para enviar tu invitación.",
      at:"a las", none:"Por confirmar"},
    en:{kicker:"Invite Nora Ivelisse", title:"Request a date", s1:"1. Pick the day", s2:"2. Pick the time", s3:"3. Tell me about the event",
      fName:"Your name", fCity:"City", fChurch:"Church or organization", fSize:"Number of people", sms:"Text", close:"Close", prev:"Previous month", next:"Next month",
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      types:["Worship service","Concert","Conference","Retreat","Special event"],
      sizes:["Under 50","50 to 150","150 to 500","Over 500"], pick:"Pick a day and a time to send your invitation.",
      at:"at", none:"To be confirmed"}
  };
  var HOURS = [8,9,10,11,12,13,14,15,16,17,18,19,20];
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
  function val(id){ return document.getElementById(id).value.trim(); }
  function update(){
    var t = L(), ok = sel.date && sel.hour !== null;
    var sum = document.getElementById("bkSum"), wa = document.getElementById("bkWa"), sms = document.getElementById("bkSms");
    if(!ok){
      sum.textContent = t.pick;
      wa.setAttribute("aria-disabled","true"); sms.setAttribute("aria-disabled","true");
      wa.href = NORA_WA; sms.href = NORA_SMS; return;
    }
    sum.innerHTML = "<b>" + dateText() + "</b> " + t.at + " <b>" + ampm(sel.hour) + "</b>";
    var name = val("bkName"), city = val("bkCity"), church = val("bkChurch");
    var sizeEl = document.getElementById("bkSize"), size = sizeEl.selectedIndex > 0 ? sizeEl.value : "";
    var type = sel.type === null ? "" : t.types[sel.type];
    var msg = bkEn
      ? "Hi Nora" + (name ? ", this is " + name : "") + ". I'd like to invite you to minister at our event.\nDate: " + dateText() + "\nTime: " + ampm(sel.hour) +
        "\nEvent type: " + (type || t.none) + "\nChurch or organization: " + (church || t.none) + "\nCity: " + (city || t.none) + "\nNumber of people: " + (size || t.none)
      : "Hola Nora" + (name ? ", soy " + name : "") + ". Me gustaría invitarte a ministrar en nuestro evento.\nFecha: " + dateText() + "\nHora: " + ampm(sel.hour) +
        "\nTipo de evento: " + (type || t.none) + "\nIglesia u organización: " + (church || t.none) + "\nCiudad: " + (city || t.none) + "\nCantidad de personas: " + (size || t.none);
    wa.href = NORA_WA + "?text=" + encodeURIComponent(msg); sms.href = NORA_SMS + "?&body=" + encodeURIComponent(msg);
    wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
  }
  ["bkName","bkCity","bkChurch","bkSize"].forEach(function(id){
    document.getElementById(id).addEventListener("input", update);
    document.getElementById(id).addEventListener("change", update);
  });
  ["bkWa","bkSms"].forEach(function(id){
    document.getElementById(id).addEventListener("click", function(e){ if(this.getAttribute("aria-disabled")) e.preventDefault(); });
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
    ["bkName","bkCity","bkChurch"].forEach(function(id){ document.getElementById(id).value = ""; });
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

  // EN / ES switch per card
  function setLang(card, en){
    card.querySelectorAll("[data-en]").forEach(function(el){
      if(el.dataset.es === undefined) el.dataset.es = el.innerHTML;
      el.innerHTML = en ? el.dataset.en : el.dataset.es;
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
        h.dataset.en = "Press the code to show it full screen"; h.dataset.es = "Presiona el código para verlo en pantalla completa";
        h.innerHTML = card.dataset.lang === "en" ? h.dataset.en : h.dataset.es;
      });
    });
  });

  // Save Contact (adds her photo when it loads)
  var base = ["BEGIN:VCARD","VERSION:3.0","N:Gerena;Nora;Ivelisse;;","FN:Nora Ivelisse",
    "ORG:Armonía del Reino Ministries",
    "TITLE:Salmista · Ministra de adoración",
    "TEL;TYPE=CELL,VOICE:+14077310427",
    "EMAIL;TYPE=INTERNET:niar787@gmail.com",
    "URL:https://www.armoniadelreino.org",
    "URL:https://okunami.pro/proposals/armonia-del-reino/",
    "ADR;TYPE=WORK:;;;Deltona;FL;;USA",
    "NOTE:Armonía del Reino Ministries. Invitaciones para cultos, conciertos, conferencias y retiros. Salmo 40:3"];
  function download(lines){
    var vcf = lines.concat(["END:VCARD"]).join("\r\n");
    var url = URL.createObjectURL(new Blob([vcf], {type:"text/vcard;charset=utf-8"}));
    var a = document.createElement("a"); a.href = url; a.download = "Nora-Ivelisse.vcf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  }
  var photoLine = null;
  fetch("images/vcf-photo.jpg").then(function(r){ return r.ok ? r.blob() : null; }).then(function(b){
    if(!b) return;
    var fr = new FileReader();
    fr.onload = function(){ photoLine = "PHOTO;ENCODING=b;TYPE=JPEG:" + String(fr.result).split(",")[1]; };
    fr.readAsDataURL(b);
  }).catch(function(){});
  document.querySelectorAll("[data-save]").forEach(function(b){
    b.addEventListener("click", function(){ download(photoLine ? base.concat([photoLine]) : base); });
  });
})();
