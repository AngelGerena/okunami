(function(){
  var WA = "https://wa.me/14079609004?text=";
  var SMS = "sms:+14079609004?&body=";
  // Dali's numbers: PLACEHOLDER until she sends hers
  var DALI_PHONE = "14075550142";
  var DALI_WA = "https://wa.me/" + DALI_PHONE + "?text=";
  var DALI_SMS = "sms:+" + DALI_PHONE + "?&body=";
  var CLIENT = "Dali";

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
      if(on){ name = t.textContent; t.scrollIntoView({block:"nearest", inline:"center"}); }
    });
    cards.forEach(function(c){ c.hidden = c.id !== id; if(c.id === id) note.textContent = c.dataset.note; });
    var msg = "Hi Angel, this is " + CLIENT + ". I want the " + name + " design for my massage therapy vCard.";
    pick.href = WA + encodeURIComponent(msg);
    pickSms.href = SMS + encodeURIComponent(msg);
    try{ localStorage.setItem("dali-look", id); }catch(e){}
  }
  tabs.forEach(function(t){
    t.addEventListener("click", function(){ show(t.dataset.look); window.scrollTo({top:0}); });
  });
  var start = "l1";
  try{ start = localStorage.getItem("dali-look") || "l1"; }catch(e){}
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

  // Booking pop-up (requests go to Dali)
  var bk = document.getElementById("bk"), lastBtn = null, es = false;
  var T = {
    en:{kicker:"Book with Dali", title:"Request an appointment", vag:"Want it instantly? Book on Vagaro",
      s1:"1. Pick the day", s2:"2. Pick the time", s3:"3. Your session", fName:"Your name", fLen:"Session length",
      sms:"Text", close:"Close", prev:"Previous month", next:"Next month",
      fine:"Your request goes to Dali. She confirms every appointment personally.",
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      types:["Swedish Relaxation","Deep Tissue","Prenatal","Hot Stone","Sports Recovery","Lymphatic Drainage","Not sure yet"],
      lens:["60 minutes","90 minutes","120 minutes"], pick:"Pick a day and a time to send your request.", at:"at", none:"To be confirmed"},
    es:{kicker:"Reserva con Dali", title:"Solicita una cita", vag:"¿La quieres al instante? Reserva en Vagaro",
      s1:"1. Elige el día", s2:"2. Elige la hora", s3:"3. Tu sesión", fName:"Tu nombre", fLen:"Duración",
      sms:"Texto", close:"Cerrar", prev:"Mes anterior", next:"Mes siguiente",
      fine:"Tu solicitud le llega a Dali. Ella confirma cada cita personalmente.",
      months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dow:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], days:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
      types:["Sueco relajante","Tejido profundo","Prenatal","Piedras calientes","Recuperación deportiva","Drenaje linfático","Aún no sé"],
      lens:["60 minutos","90 minutos","120 minutos"], pick:"Elige un día y una hora para enviar tu solicitud.", at:"a las", none:"Por confirmar"}
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
    var t = L(), slots = document.getElementById("slots"), types = document.getElementById("evType"), len = document.getElementById("bkLen");
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
    var keep = len.selectedIndex;
    len.innerHTML = "<option value=''>—</option>" + t.lens.map(function(s){ return "<option>"+s+"</option>"; }).join("");
    len.selectedIndex = keep > 0 ? keep : 0;
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
      wa.href = "https://wa.me/" + DALI_PHONE; sms.href = "sms:+" + DALI_PHONE; return;
    }
    sum.innerHTML = "<b>" + dateText() + "</b> " + t.at + " <b>" + ampm(sel.hour) + "</b>";
    var name = document.getElementById("bkName").value.trim();
    var lenEl = document.getElementById("bkLen"), len = lenEl.selectedIndex > 0 ? lenEl.value : "";
    var type = sel.type === null ? "" : t.types[sel.type];
    var msg = es
      ? "Hola Dali" + (name ? ", soy " + name : "") + ". Quisiera solicitar una cita de masaje.\nFecha: " + dateText() + "\nHora: " + ampm(sel.hour) +
        "\nServicio: " + (type || t.none) + "\nDuración: " + (len || t.none)
      : "Hi Dali" + (name ? ", this is " + name : "") + ". I'd like to request a massage appointment.\nDate: " + dateText() + "\nTime: " + ampm(sel.hour) +
        "\nService: " + (type || t.none) + "\nSession length: " + (len || t.none);
    wa.href = DALI_WA + encodeURIComponent(msg); sms.href = DALI_SMS + encodeURIComponent(msg);
    wa.removeAttribute("aria-disabled"); sms.removeAttribute("aria-disabled");
  }
  document.getElementById("bkName").addEventListener("input", update);
  document.getElementById("bkLen").addEventListener("change", update);

  var VARS = ["--bg","--ink","--muted","--accent","--on","--panel","--line","--fd","--fb"];
  function openBk(btn){
    lastBtn = btn; var card = btn.closest(".card");
    es = card && card.dataset.lang === "es";
    var cs = getComputedStyle(card);
    VARS.forEach(function(v){ bk.style.setProperty(v, cs.getPropertyValue(v)); });
    sel = {date:null, hour:null, type:null};
    document.getElementById("bkName").value = ""; document.getElementById("bkLen").selectedIndex = 0;
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

  // Save Contact (PLACEHOLDER details until Dali sends hers)
  var vcf = ["BEGIN:VCARD","VERSION:3.0","N:;Dali;;;","FN:Dali",
    "ORG:Dali Massage Therapy",
    "TITLE:Licensed Massage Therapist",
    "TEL;TYPE=CELL,VOICE:+" + DALI_PHONE,
    "EMAIL;TYPE=INTERNET:dali@example.com",
    "URL:https://okunami.pro/proposals/dali/",
    "NOTE:Massage therapy in Central Florida. Book online on Vagaro.",
    "END:VCARD"].join("\r\n");
  document.querySelectorAll("[data-save]").forEach(function(b){
    b.addEventListener("click", function(){
      var url = URL.createObjectURL(new Blob([vcf], {type:"text/vcard;charset=utf-8"}));
      var a = document.createElement("a"); a.href = url; a.download = "Dali.vcf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    });
  });
})();
