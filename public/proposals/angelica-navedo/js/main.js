(function(){
  var WA = "https://wa.me/14079609004?text=";
  var SMS = "sms:+14079609004?&body=";
  var pickSms = document.getElementById("pickSms");
  var notes = {
    l1: "Ivory and gold, arch-framed portrait. Closest to her printed banner, so her brand feels consistent.",
    l2: "Navy with gold foil and a full-bleed portrait. The most dramatic, made for showing across a table.",
    l3: "Her venues as scattered photo prints up top. Leads with the places couples fall in love with.",
    l4: "Wedding-invitation stationery with a Request a Tour button. Speaks directly to brides and planners.",
    l5: "Florida resort greens with palm frond line art and a big smooth curve. Feels like the property itself.",
    l6: "White marble and a resort keycard up top. Five-star concierge energy.",
    l7: "Sunset glow over her lawn ceremony photo with frosted-glass panels. The most romantic of the set.",
    l8: "An ivory envelope sealed with a gold AN monogram on navy velvet. Opens like an invitation.",
    l9: "Blush and rose gold with champagne bubbles and a slanted divider. Soft, bridal and celebratory."
  };
  var names = {l1:"Gilded Gazebo", l2:"Midnight Ballroom", l3:"Venue Prints", l4:"Save the Date",
    l5:"Palm Breeze", l6:"Marble Concierge", l7:"Golden Hour", l8:"Wax Seal", l9:"Champagne Blush"};
  var tabs = document.querySelectorAll(".tab");
  var pick = document.getElementById("pickBtn");
  var note = document.getElementById("note");
  function show(id){
    tabs.forEach(function(t){ t.setAttribute("aria-selected", t.dataset.look === id ? "true" : "false"); });
    document.querySelectorAll(".card").forEach(function(c){ c.hidden = c.id !== id; });
    note.textContent = notes[id];
    var pickMsg = "Hi Angel, this is Angélica Navedo. I want the " + names[id] + " design for my vCard.";
    pick.href = WA + encodeURIComponent(pickMsg);
    pickSms.href = SMS + encodeURIComponent(pickMsg);
    try{ localStorage.setItem("an-look", id); }catch(e){}
  }
  tabs.forEach(function(t){ t.addEventListener("click", function(){ show(t.dataset.look); window.scrollTo({top:0}); }); });
  var start = "l1"; try{ start = localStorage.getItem("an-look") || "l1"; }catch(e){}
  if(!names[start]) start = "l1";
  show(start);

  var ownMsg = WA + encodeURIComponent("Hi Angel, I really like the vCard you made for Angélica Navedo. I'd love to get one for myself.");
  document.querySelectorAll("[data-own]").forEach(function(a){ a.href = ownMsg; });
  var ownText = "Hi Angel, I really like the vCard you made for Angélica Navedo. I'd love to get one for myself.";
  document.querySelectorAll("[data-own-sms]").forEach(function(a){ a.href = SMS + encodeURIComponent(ownText); });

  var vcf = ["BEGIN:VCARD","VERSION:3.0","N:Navedo;Angélica;;;","FN:Angélica Navedo","ORG:Rentyl Resorts",
    "TITLE:Senior Event Sales Manager","TEL;TYPE=WORK,VOICE:+13214150133","EMAIL;TYPE=WORK:angelica.navedo@rentyl.com",
    "URL:https://rentylresorts.com","END:VCARD"].join("\r\n");
  document.querySelectorAll("[data-save]").forEach(function(b){
    b.addEventListener("click", function(){
      var url = URL.createObjectURL(new Blob([vcf], {type:"text/vcard;charset=utf-8"}));
      var a = document.createElement("a"); a.href = url; a.download = "Angelica-Navedo.vcf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    });
  });
})();
