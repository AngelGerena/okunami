// OKUNAMI kit: in-card video player.
// Every YouTube or Vimeo link on the page plays inside the card: links open a bottom-sheet player,
// links with class "video-inline" turn into the player right where they sit. The href stays a real
// link, and the sheet offers "Open it on YouTube/Vimeo" in case an owner blocks playback on other sites.
(function(){
  function videoSrc(href){
    var m=href.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    if(m) return {src:"https://www.youtube-nocookie.com/embed/"+m[1]+"?autoplay=1&playsinline=1&rel=0&modestbranding=1",site:"YouTube"};
    m=href.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if(m) return {src:"https://player.vimeo.com/video/"+m[1]+"?autoplay=1&playsinline=1&title=0&byline=0",site:"Vimeo"};
    return null;
  }
  function frame(src,title){
    var f=document.createElement("iframe"); f.src=src; f.title=title||"Video";
    f.setAttribute("allow","autoplay; encrypted-media; picture-in-picture; fullscreen"); f.setAttribute("allowfullscreen",""); return f;
  }
  function labelOf(a){
    var el=(a.querySelector("[data-video-title],b,span:not(.ic):not(.play)")||a).cloneNode(true);
    el.querySelectorAll("small").forEach(function(s){ s.remove(); });
    return el.textContent.replace(/\s+/g," ").trim()||"Video";
  }
  var sheet=document.createElement("div");
  sheet.className="okv-sheet"; sheet.hidden=true; sheet.setAttribute("role","dialog"); sheet.setAttribute("aria-modal","true");
  sheet.innerHTML='<div class="okv-panel"><div class="okv-top"><b class="okv-title">Video</b><button class="okv-close" type="button" aria-label="Close video">'+
    '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>'+
    '<div class="okv-frame"></div><a class="okv-out" href="#" target="_blank" rel="noopener">Video not playing? Open it</a></div>';
  document.body.appendChild(sheet);
  var box=sheet.querySelector(".okv-frame"), title=sheet.querySelector(".okv-title"), out=sheet.querySelector(".okv-out"), close=sheet.querySelector(".okv-close"), last=null;
  sheet.setAttribute("aria-label","Video player");
  function shut(){ box.innerHTML=""; sheet.hidden=true; document.body.style.overflow=""; if(last) last.focus(); }
  function open(a,v){
    last=a; var t=labelOf(a); title.textContent=t; out.href=a.href; out.textContent="Video not playing? Open it on "+v.site;
    box.innerHTML=""; box.appendChild(frame(v.src,t)); sheet.hidden=false; document.body.style.overflow="hidden"; close.focus();
  }
  close.addEventListener("click",shut);
  sheet.addEventListener("click",function(e){ if(e.target===sheet) shut(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!sheet.hidden) shut(); });
  document.querySelectorAll("a[href]").forEach(function(a){
    if(a.closest(".okv-sheet")) return;
    var v=videoSrc(a.getAttribute("href")); if(!v) return;
    a.dataset.video=v.src;
    a.addEventListener("click",function(e){
      e.preventDefault();
      if(a.classList.contains("video-inline")){
        var d=document.createElement("div"); d.className="okv-inline-playing "+a.className.replace("video-inline","");
        d.appendChild(frame(v.src,labelOf(a))); a.replaceWith(d); return;
      }
      open(a,v);
    });
  });
})();
