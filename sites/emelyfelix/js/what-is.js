/* What is U-MUVO?: the product video at the top of the Products section.
   Nothing downloads until the visitor presses play. Plays the Spanish version when the card
   is in Spanish and the English one otherwise, and swaps if the language changes mid-video. */
(function () {
  document.querySelectorAll("[data-whatis]").forEach(function (box) {
    var vid = box.querySelector("video");
    var btn = box.querySelector(".wi-play");
    var card = box.closest(".card");
    if (!vid || !btn) return;
    function es() { return !!card && card.dataset.lang === "es"; }
    function pickSource() {
      var want = es() ? vid.dataset.esSrc : vid.dataset.enSrc;
      if (want && vid.getAttribute("src") !== want) { vid.setAttribute("src", want); vid.load(); }
    }
    btn.addEventListener("click", function () {
      pickSource();
      box.classList.add("is-on");
      vid.controls = true;
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
    });
    if (card && window.MutationObserver) {
      new MutationObserver(function () {
        if (!box.classList.contains("is-on")) return;
        var playing = !vid.paused; pickSource();
        if (playing) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
      }).observe(card, { attributes: true, attributeFilter: ["data-lang"] });
    }
  });
})();
