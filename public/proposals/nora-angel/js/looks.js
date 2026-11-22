/* Look switcher for the Nora & Angel proposal page. One card, four looks.
   "I want this one" sends the chosen look to Angel by WhatsApp or text. */
(function () {
  "use strict";
  var LOOKS = {
    lounge: { name: "Lounge", note: "Ivory, wine and gold to match your suits. Framed photo, elegant serif names with a script ampersand." },
    duo: { name: "Duo", note: "Bold green hero with a slanted edge, and a contact row for each of you so people reach the right person in one press." },
    seal: { name: "Gold Seal", note: "Round portrait inside a slowly turning engraved gold ring. Buttons stack as a clean list, easy for any thumb." },
    signature: { name: "Signature", note: "Wide photo with a smooth lime curve, your names stacked big with a script ampersand. Fresh and modern." }
  };
  var ANGEL = "14079609004";
  var tabs = [].slice.call(document.querySelectorAll(".tab[data-look]"));
  var note = document.querySelector(".look-note");
  var wa = document.querySelector('[data-want="wa"]'), sms = document.querySelector('[data-want="sms"]');
  function set(k) {
    if (!LOOKS[k]) k = "lounge";
    Object.keys(LOOKS).forEach(function (x) { document.body.classList.toggle("lk-" + x, x === k); });
    tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.look === k ? "true" : "false"); });
    note.textContent = LOOKS[k].note;
    var msg = "Hi Angel, let's go with the " + LOOKS[k].name + " look for the Nora & Angel U-MUVO card.";
    wa.href = "https://wa.me/" + ANGEL + "?text=" + encodeURIComponent(msg);
    sms.href = "sms:+" + ANGEL + "?&body=" + encodeURIComponent(msg);
    try { history.replaceState(null, "", "?look=" + k); } catch (e) {}
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { set(t.dataset.look); }); });
  var q = (location.search.match(/[?&]look=([a-z]+)/) || [])[1];
  set(q || "lounge");
})();
