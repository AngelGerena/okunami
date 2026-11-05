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

  // Booking request (to Mayra), follows the card language
  function hireMsg(en){
    return en
      ? "Hi Mayra, I saw your card and I'd like to book you for an event.\nEvent type: \nDate: \nCity: \nAudience size: "
      : "Hola Mayra, vi tu tarjeta y me gustaría contratarte para un evento.\nTipo de evento: \nFecha: \nCiudad: \nCantidad de personas: ";
  }
  function setHire(card, en){
    card.querySelectorAll("[data-hire]").forEach(function(a){ a.href = MAYRA_WA + encodeURIComponent(hireMsg(en)); });
    card.querySelectorAll("[data-hire-sms]").forEach(function(a){ a.href = MAYRA_SMS + encodeURIComponent(hireMsg(en)); });
  }

  // EN / ES switch per card
  function setLang(card, en){
    card.querySelectorAll("[data-en]").forEach(function(el){
      if(el.dataset.es === undefined) el.dataset.es = el.textContent;
      el.textContent = en ? el.dataset.en : el.dataset.es;
    });
    card.dataset.lang = en ? "en" : "es";
    var b = card.querySelector("[data-lang]");
    if(b) b.textContent = en ? "ES" : "EN";
    setHire(card, en);
  }
  document.querySelectorAll(".card").forEach(function(card){
    setHire(card, false);
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
