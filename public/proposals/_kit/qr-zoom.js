// OKUNAMI kit: QR full screen. Every share QR (.qr img) can be pressed to show it full screen for easy scanning.
(function(){
  var NAME=(document.body.dataset.qrName||"").trim();
  var CAP=NAME?"Scan to save "+NAME+"\x27s card":"Scan to save this card";
  var full=document.createElement("div");
  full.className="qr-full"; full.hidden=true; full.setAttribute("role","dialog"); full.setAttribute("aria-modal","true"); full.setAttribute("aria-label","QR code, full screen");
  full.innerHTML='<button class="qr-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>'+
    '<img alt="'+CAP+'"><p>'+CAP+'<small>Point your phone camera at the code</small></p>';
  document.body.appendChild(full);
  var big=full.querySelector("img"), x=full.querySelector(".qr-x"), last=null;
  function close(){
    full.hidden=true; document.body.style.overflow="";
    if(document.fullscreenElement && document.exitFullscreen){ document.exitFullscreen().catch(function(){}); }
    if(last) last.focus();
  }
  function open(src,btn){
    last=btn; big.src=src; full.hidden=false; document.body.style.overflow="hidden"; x.focus();
    if(full.requestFullscreen){ full.requestFullscreen().catch(function(){}); }
  }
  x.addEventListener("click", close);
  full.addEventListener("click", function(e){ if(e.target===full || e.target===big) close(); });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape" && !full.hidden) close(); });
  document.addEventListener("fullscreenchange", function(){ if(!document.fullscreenElement && !full.hidden) close(); });
  document.querySelectorAll(".qr img").forEach(function(img){
    if(img.closest(".qr-zoom")) return;
    var b=document.createElement("button"); b.type="button"; b.className="qr-zoom"; b.setAttribute("aria-label","Show the QR code full screen");
    img.replaceWith(b); b.appendChild(img);
    b.insertAdjacentHTML("beforeend",'<span class="qr-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
    b.addEventListener("click", function(){ open(img.currentSrc||img.src,b); });
    var p=b.parentElement.querySelector("p");
    if(p && !p.querySelector(".qr-hint")) p.insertAdjacentHTML("beforeend",'<span class="qr-hint">Press the code to show it full screen</span>');
  });
})();
