/* Learn More: opens and plays the business opportunity video inline, right under the Join buttons. */
(function () {
  document.querySelectorAll("[data-learn]").forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute("aria-controls"));
    if (!box) return;
    var vid = box.querySelector("video");
    var lbl = btn.querySelector(".learn-lbl");
    function es() { var c = btn.closest(".card"); return !!c && c.dataset.lang === "es"; }
    function label(open) {
      var en = open ? "Hide video" : "Learn More", sp = open ? "Ocultar video" : "Saber m&aacute;s";
      lbl.dataset.en = en; lbl.dataset.es = sp; lbl.innerHTML = es() ? sp : en;
    }
    btn.addEventListener("click", function () {
      var open = box.hidden;
      box.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      label(open);
      if (open) {
        var p = vid.play(); if (p && p.catch) p.catch(function () {});
        setTimeout(function () { box.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
      } else { vid.pause(); }
    });
  });
})();
