/* Soft UI sound effects, made in the browser (no audio files, nothing to download).
   Starts on the visitor's first press, as iPhone requires. Kept quiet on purpose.
   iPhone plays these only when the ring/silent switch is on ring. */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  var ctx = null, master = null, VOL = 0.5;
  function ready() {
    if (!ctx) { try { ctx = new AC(); master = ctx.createGain(); master.gain.value = VOL; master.connect(ctx.destination); } catch (e) { ctx = null; return false; } }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  }
  function tone(freq, start, dur, type, peak, endFreq) {
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + start;
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak || 0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  var S = {
    tap: function () { tone(1250, 0, 0.05, "sine", 0.12, 900); },
    toggle: function () { tone(700, 0, 0.05, "triangle", 0.14); tone(1050, 0.05, 0.06, "triangle", 0.12); },
    pop: function () { tone(320, 0, 0.18, "sine", 0.22, 880); tone(1320, 0.12, 0.12, "sine", 0.08); },
    close: function () { tone(880, 0, 0.12, "sine", 0.12, 420); },
    pick: function () { tone(1600, 0, 0.035, "sine", 0.09); },
    chime: function () { tone(784, 0, 0.35, "sine", 0.16); tone(1046.5, 0.09, 0.4, "sine", 0.14); tone(1568, 0.18, 0.5, "sine", 0.1); },
    send: function () { tone(520, 0, 0.16, "sine", 0.14, 1040); tone(1560, 0.12, 0.14, "sine", 0.07); }
  };
  function play(n) { if (ready() && S[n]) try { S[n](); } catch (e) {} }
  window.cardSound = play;
  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest("a, button, [role=switch], input, select"); if (!el) return;
    if (el.closest(".gate")) return;                                    /* PIN pad stays silent */
    if (el.matches("[data-lang], .lang")) return play("toggle");
    if (el.matches("[data-save]")) return play("chime");
    if (el.closest(".qr-zoom")) return play("pop");
    if (el.matches(".qr-x, [data-bk-close], .bk-x")) return play("close");
    if (el.matches("#bkWa, #bkSms") && el.getAttribute("aria-disabled") !== "true") return play("send");
    if (el.closest("#calGrid, #slots, #evType")) return play("pick");
    if (el.matches("[data-hire]")) return play("pop");
    if (el.matches("input, select")) return;
    play("tap");
  }, { passive: true });
})();
