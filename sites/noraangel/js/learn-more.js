/* Learn More: opens and plays the business opportunity video inline, right under the Join buttons.
   Plays the Spanish version when the card is in Spanish, the English one otherwise. */
(function () {
  document.querySelectorAll("[data-learn]").forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute("aria-controls"));
    if (!box) return;
    var vid = box.querySelector("video");
    var lbl = btn.querySelector(".learn-lbl");
    var card = btn.closest(".card");
    function es() { return !!card && card.dataset.lang === "es"; }
    function label(open) {
      var en = open ? "Hide video" : "Learn More", sp = open ? "Ocultar video" : "Saber m&aacute;s";
      lbl.dataset.en = en; lbl.dataset.es = sp; lbl.innerHTML = es() ? sp : en;
    }
    function pickSource() {
      var want = es() ? vid.dataset.esSrc : vid.dataset.enSrc;
      if (want && vid.getAttribute("src") !== want) { vid.setAttribute("src", want); vid.load(); }
    }
    btn.addEventListener("click", function () {
      var open = box.hidden;
      box.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      label(open);
      if (open) {
        pickSource();
        var p = vid.play(); if (p && p.catch) p.catch(function () {});
        setTimeout(function () { box.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
      } else { vid.pause(); }
    });
    /* language switched while the video is showing: swap to the matching version */
    if (card && window.MutationObserver) {
      new MutationObserver(function () {
        if (box.hidden) return;
        var playing = !vid.paused; pickSource(); if (playing) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
      }).observe(card, { attributes: true, attributeFilter: ["data-lang"] });
    }
  });
})();
