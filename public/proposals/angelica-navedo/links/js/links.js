(function(){
  function fill(sel, id){ var t=document.getElementById(id); document.querySelectorAll(sel).forEach(function(el){ el.replaceWith(t.content.cloneNode(true)); }); }
  fill("[data-head]","tpl-head"); fill("[data-actions]","tpl-actions"); fill("[data-extras]","tpl-extras"); fill("[data-foot]","tpl-foot");

  var WA="https://wa.me/14079609004?text=", SMS="sms:+14079609004?&body=";
  var notes={la:"Each venue gets its own swipeable card with its tour and booking links. Shows your full range.",
    lb:"Weddings, Events and Tours tabs. Short and tidy: all your links fit on one screen.",
    lc:"Leads with the video tour, then 3D and videos, then a big Book a Tour button. Sells the venue before anything else.",
    ld:"Collapsible sections, like a hotel concierge menu. The most compact, and easy to grow as you add links."};
  var names={la:"Venue Collection",lb:"Tabbed Menu",lc:"Tour First",ld:"Concierge Menu"};
  var tabs=document.querySelectorAll(".tab"), note=document.getElementById("note");
  var pickWa=document.getElementById("pickWa"), pickSms=document.getElementById("pickSms");
  function show(id){
    tabs.forEach(function(t){ t.setAttribute("aria-selected", t.dataset.look===id?"true":"false"); });
    document.querySelectorAll(".card").forEach(function(c){ c.hidden=c.id!==id; });
    note.textContent=notes[id];
    var m="Hi Angel, this is Angélica Navedo. For my venue links I want the " + names[id] + " layout.";
    pickWa.href=WA+encodeURIComponent(m); pickSms.href=SMS+encodeURIComponent(m);
  }
  tabs.forEach(function(t){ t.addEventListener("click", function(){ show(t.dataset.look); window.scrollTo({top:0}); }); });
  show("la");

  document.querySelectorAll(".seg").forEach(function(seg){
    var btns=seg.querySelectorAll("button");
    btns.forEach(function(b){ b.addEventListener("click", function(){
      btns.forEach(function(x){ x.setAttribute("aria-selected", x===b?"true":"false"); document.getElementById(x.dataset.pane).hidden = x!==b; });
    }); });
  });

  var tour="mailto:angelica.navedo@rentyl.com?subject="+encodeURIComponent("Venue tour request")+"&body="+encodeURIComponent("Hi Angélica, I'd like to schedule a venue tour. Event type: \nDate: \nGuest count: ");
  document.querySelectorAll("[data-tour]").forEach(function(a){ a.href=tour; });
  var own="Hi Angel, I really like the vCard you made for Angélica Navedo, and I would like you to create one for me as well. Please contact me at your earliest convenience. Thank you!";
  document.querySelectorAll("[data-own]").forEach(function(a){ a.href=WA+encodeURIComponent(own); });
  document.querySelectorAll("[data-own-sms]").forEach(function(a){ a.href=SMS+encodeURIComponent(own); });

  var vcf=["BEGIN:VCARD","VERSION:3.0","N:Navedo;Angélica;;;","FN:Angélica Navedo","ORG:Rentyl Resorts","TITLE:Senior Event Sales Manager",
    "TEL;TYPE=WORK,VOICE:+13214150133","EMAIL;TYPE=WORK:angelica.navedo@rentyl.com","ADR;TYPE=WORK:;;7635 Fairfax Dr;Kissimmee;FL;34747;USA",
    "URL:https://rentylresorts.com","END:VCARD"].join("\r\n");
  document.querySelectorAll("[data-save]").forEach(function(b){ b.addEventListener("click", function(){
    var url=URL.createObjectURL(new Blob([vcf],{type:"text/vcard;charset=utf-8"}));
    var a=document.createElement("a"); a.href=url; a.download="Angelica-Navedo.vcf"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); },1500);
  }); });
})();
