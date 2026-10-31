/* The Jesus Cartel - OKUNAMI vCard proposal
   Edit CONFIG below once the owner's details come in. */

const CONFIG = {
  brand: "The Jesus Cartel",
  person: "Owner Name",            // TODO: owner's name
  title: "Founder",                // TODO: owner's title
  phone: "",                       // TODO: digits only, e.g. 4075551234 (buttons hide until filled)
  email: "",                       // TODO: e.g. hello@thejesuscartel.com
  instagram: "",                   // TODO: handle without @
  facebook: "",                    // TODO: page URL
  tiktok: "",                      // TODO: handle without @
  video: "",                       // optional YouTube or Vimeo URL, plays inside the card
  website: "https://www.thejesuscartel.com",
  shop: "https://www.thejesuscartel.com/collections/all",
  address: "3391 NE Jacksonville Rd, Ocala, FL 34479",
  logo: "https://www.thejesuscartel.com/cdn/shop/files/4346D6E80F86A773CABC087D15CDABCF.jpg?v=1660343456&width=600",
  mission: "Spreading the good news of Jesus Christ to the nations through clothing.",
  impact: "Every purchase helps feed kids in need.",
  verseText: "Behold, he cometh with clouds; and every eye shall see him.",
  verseRef: "Revelation 1:7",
  cardUrl: "https://okunami.pro/proposals/the-jesus-cartel/",
  angelPhone: "14079609004",
  products: [
    { name: "Hope Dealer", price: "$50", url: "https://www.thejesuscartel.com/products/hope-dealer", img: "https://www.thejesuscartel.com/cdn/shop/files/058161CA-2601-4222-96D5-B02B3A80F71F.png?v=1787367091&width=533" },
    { name: "Glory Addict", price: "$50", url: "https://www.thejesuscartel.com/products/glory-addict", img: "https://www.thejesuscartel.com/cdn/shop/files/B0E4DAD5-E605-4299-B1F1-0C0E4A5B78D6.png?v=1787366980&width=533" },
    { name: "Elohim Jersey", price: "$50", url: "https://www.thejesuscartel.com/products/red-jersey", img: "https://www.thejesuscartel.com/cdn/shop/products/IMG_10932.jpg?v=1664844253&width=533" },
    { name: "Camo Soul Trafficker", price: "$50", url: "https://www.thejesuscartel.com/products/camo-spiritual-sniper", img: "https://www.thejesuscartel.com/cdn/shop/files/IMG-1341.png?v=1784011319&width=533" },
    { name: "God's Soldier Jersey", price: "$50", url: "https://www.thejesuscartel.com/products/gods-soldier-jersey", img: "https://www.thejesuscartel.com/cdn/shop/files/47259273-8BCD-4B99-A730-ACC0801D67F7.png?v=1787412137&width=533" },
    { name: "Bucket Hats", price: "$25", url: "https://www.thejesuscartel.com/products/jesus-cartel-bucket-hats", img: "https://www.thejesuscartel.com/cdn/shop/files/F094A0C7-D524-40BD-93E0-EC1C6FE46E35.jpg?v=1721327701&width=533" },
    { name: "Jehu Anointing Flags", price: "$325", url: "https://www.thejesuscartel.com/products/lord-of-host-worship-flags", img: "https://www.thejesuscartel.com/cdn/shop/files/F2DEFD78-8AFF-4954-B207-BE8AB793F042.jpg?v=1791696910&width=533" },
    { name: "Gift Card", price: "From $10", url: "https://www.thejesuscartel.com/products/jesus-cartel-gift-card", img: "https://www.thejesuscartel.com/cdn/shop/products/BE7D317B-78F0-42D6-8F31-EF9C8A799A75.png?v=1670809749&width=533" }
  ]
};

const LOOKS = [
  { id: "contraband", name: "Contraband" },
  { id: "jersey", name: "Jersey Drop" },
  { id: "wanted", name: "Wanted" },
  { id: "revelation", name: "Revelation" }
];

/* ---------- icons (flat SVG, no emoji) ---------- */
const I = {
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z"/></svg>',
  text: '<svg viewBox="0 0 24 24"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 1-2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.5L20.5 7h-17Z"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M20 4a10 10 0 0 0-15.7 12l-1.3 5 5.1-1.3A10 10 0 1 0 20 4Zm-3.6 10c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.2-.2-.4-.3Z"/></svg>',
  shop: '<svg viewBox="0 0 24 24"><path d="M6 7V6a6 6 0 0 1 12 0v1h3l-1 14H4L3 7Zm2 0h8V6a4 4 0 0 0-8 0Z"/></svg>',
  web: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8ZM12 4a13.8 13.8 0 0 1 1.9 4h-3.8A13.8 13.8 0 0 1 12 4ZM4.3 14a8 8 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4Zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16Zm3-8h-3a8 8 0 0 1 4.4-3.6A15.7 15.7 0 0 0 8.1 8ZM12 20a13.8 13.8 0 0 1-1.9-4h3.8A13.8 13.8 0 0 1 12 20Zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4Zm.2 5.6a15.7 15.7 0 0 0 1.4-3.6h3a8 8 0 0 1-4.4 3.6Zm1.8-5.6a16.5 16.5 0 0 0 0-4h3.4a8 8 0 0 1 0 4Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M12 3a1 1 0 0 1 1 1v9.6l3.3-3.3 1.4 1.4L12 17.4l-5.7-5.7 1.4-1.4 3.3 3.3V4a1 1 0 0 1 1-1ZM4 19h16v2H4Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>',
  fb: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8Z"/></svg>',
  tt: '<svg viewBox="0 0 24 24"><path d="M16 3c.4 2.4 1.9 4 4 4.2v3.3a7.6 7.6 0 0 1-4-1.3v6.3a6 6 0 1 1-6-6v3.4a2.6 2.6 0 1 0 2.6 2.6V3Z"/></svg>',
  qr: '<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3Zm2 2v4h4V5Zm8-2h8v8h-8Zm2 2v4h4V5ZM3 13h8v8H3Zm2 2v4h4v-4Zm8-2h3v3h-3Zm5 0h3v3h-3Zm-5 5h3v3h-3Zm5 0h3v3h-3Z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h12m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7Z"/></svg>'
};

/* ---------- helpers ---------- */
const enc = encodeURIComponent;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const telHref = () => CONFIG.phone ? `tel:+1${CONFIG.phone}` : "";
const smsHref = () => CONFIG.phone ? `sms:+1${CONFIG.phone}` : "";
const waHref = () => CONFIG.phone ? `https://wa.me/1${CONFIG.phone}` : "";
const mailHref = () => CONFIG.email ? `mailto:${CONFIG.email}` : "";
const mapHref = () => `https://maps.google.com/?q=${enc(CONFIG.address)}`;
const smsLink = (num, body) => {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return `sms:+${num}${ios ? "&" : "?"}body=${enc(body)}`;
};

function contactButtons(cls) {
  const b = [];
  if (CONFIG.phone) {
    b.push(`<a class="${cls}" href="${telHref()}">${I.phone}<span>Call</span></a>`);
    b.push(`<a class="${cls}" href="${smsHref()}">${I.text}<span>Text</span></a>`);
    b.push(`<a class="${cls}" href="${waHref()}" target="_blank" rel="noopener">${I.wa}<span>WhatsApp</span></a>`);
  }
  if (CONFIG.email) b.push(`<a class="${cls}" href="${mailHref()}">${I.mail}<span>Email</span></a>`);
  b.push(`<a class="${cls}" href="${CONFIG.shop}" target="_blank" rel="noopener">${I.shop}<span>Shop</span></a>`);
  b.push(`<a class="${cls}" href="${mapHref()}" target="_blank" rel="noopener">${I.pin}<span>Visit</span></a>`);
  return b.join("");
}

function socials(cls) {
  const s = [];
  if (CONFIG.instagram) s.push(`<a class="${cls}" href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>`);
  if (CONFIG.facebook) s.push(`<a class="${cls}" href="${CONFIG.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a>`);
  if (CONFIG.tiktok) s.push(`<a class="${cls}" href="https://tiktok.com/@${CONFIG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${I.tt}</a>`);
  s.push(`<a class="${cls}" href="${CONFIG.website}" target="_blank" rel="noopener" aria-label="Website">${I.web}</a>`);
  return s.join("");
}

function products(cls, limit = 8) {
  return CONFIG.products.slice(0, limit).map(p => `
    <a class="${cls}" href="${p.url}" target="_blank" rel="noopener">
      <span class="${cls}-img"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></span>
      <span class="${cls}-name">${esc(p.name)}</span>
      <span class="${cls}-price">${esc(p.price)}</span>
    </a>`).join("");
}

function videoBlock(cls) {
  if (!CONFIG.video) return "";
  return `<button class="${cls}" data-video>${I.play}<span>Watch the story</span></button>`;
}

function actionRow(cls) {
  return `
    <button class="${cls}" data-save>${I.save}<span>Save Contact</span></button>
    <button class="${cls}" data-qr>${I.qr}<span>QR Code</span></button>
    <button class="${cls}" data-share>${I.share}<span>Share</span></button>`;
}

function credit() {
  return `<footer class="credit"><a href="https://finessemedia.pro" target="_blank" rel="noopener">Crafted by Finesse Media</a></footer>`;
}

/* ---------- LOOK 1: Contraband ---------- */
function lookContraband() {
  return `
  <article class="cb">
    <div class="cb-tape"><span>HANDLE WITH FAITH &nbsp;/&nbsp; HANDLE WITH FAITH &nbsp;/&nbsp; HANDLE WITH FAITH &nbsp;/&nbsp; HANDLE WITH FAITH</span></div>
    <section class="cb-hero">
      <img class="cb-logo" src="${CONFIG.logo}" alt="${esc(CONFIG.brand)} logo">
      <p class="cb-kicker">Evangelism. Distributed.</p>
      <h1 class="cb-name">${esc(CONFIG.person)}</h1>
      <p class="cb-title">${esc(CONFIG.title)} &middot; ${esc(CONFIG.brand)}</p>
      <div class="cb-qr" data-qr title="Open full screen"><div class="qr-mini"></div><span>Scan to save</span></div>
    </section>
    <section class="cb-actions">${contactButtons("cb-btn")}</section>
    <section class="cb-row">${actionRow("cb-pill")}</section>
    ${videoBlock("cb-video")}
    <section class="cb-sec">
      <div class="cb-sec-head"><h2>Current Shipment</h2><a href="${CONFIG.shop}" target="_blank" rel="noopener">Full catalog ${I.arrow}</a></div>
      <div class="cb-scroll">${products("cb-prod")}</div>
    </section>
    <section class="cb-mission">
      <h2>The Operation</h2>
      <p>${esc(CONFIG.mission)}</p>
      <p class="cb-impact">${I.heart}<span>${esc(CONFIG.impact)}</span></p>
    </section>
    <section class="cb-verse"><p>&ldquo;${esc(CONFIG.verseText)}&rdquo;</p><span>${esc(CONFIG.verseRef)}</span></section>
    <section class="cb-social">${socials("cb-soc")}</section>
    ${credit()}
  </article>`;
}

/* ---------- LOOK 2: Jersey Drop ---------- */
function lookJersey() {
  return `
  <article class="jy">
    <section class="jy-hero">
      <div class="jy-mesh"></div>
      <img class="jy-logo" src="${CONFIG.logo}" alt="${esc(CONFIG.brand)} logo">
      <div class="jy-back">
        <span class="jy-backname">${esc(CONFIG.person.split(" ").slice(-1)[0] || CONFIG.person)}</span>
        <span class="jy-number">77</span>
      </div>
      <p class="jy-role">${esc(CONFIG.title)} / ${esc(CONFIG.brand)}</p>
    </section>
    <div class="jy-stripe"></div>
    <section class="jy-actions">${contactButtons("jy-btn")}</section>
    <section class="jy-row">${actionRow("jy-pill")}</section>
    ${videoBlock("jy-video")}
    <section class="jy-sec">
      <h2><span>Season Drop</span></h2>
      <div class="jy-grid">${products("jy-prod", 6)}</div>
      <a class="jy-all" href="${CONFIG.shop}" target="_blank" rel="noopener">Shop all gear ${I.arrow}</a>
    </section>
    <section class="jy-mission">
      <div class="jy-stat"><b>1</b><span>Mission</span></div>
      <p>${esc(CONFIG.mission)} ${esc(CONFIG.impact)}</p>
    </section>
    <section class="jy-qr-block">
      <div class="jy-qr" data-qr><div class="qr-mini"></div></div>
      <div><h3>Scan to roster up</h3><p>Press the code to open it full screen.</p></div>
    </section>
    <section class="jy-verse"><p>${esc(CONFIG.verseText)}</p><span>${esc(CONFIG.verseRef)}</span></section>
    <section class="jy-social">${socials("jy-soc")}</section>
    ${credit()}
  </article>`;
}

/* ---------- LOOK 3: Wanted ---------- */
function lookWanted() {
  return `
  <article class="wt">
    <section class="wt-poster">
      <p class="wt-head">Wanted</p>
      <p class="wt-sub">for spreading the Gospel</p>
      <div class="wt-frame"><img src="${CONFIG.logo}" alt="${esc(CONFIG.brand)} logo"></div>
      <h1 class="wt-name">${esc(CONFIG.person)}</h1>
      <p class="wt-alias">a.k.a. ${esc(CONFIG.title)}, ${esc(CONFIG.brand)}</p>
      <div class="wt-charges">
        <p><b>Charges:</b> Dealing hope. Trafficking souls to the Kingdom. Addicted to glory.</p>
        <p><b>Last seen:</b> ${esc(CONFIG.address)}</p>
      </div>
      <div class="wt-reward"><span>Reward</span><b>Eternal Life</b><small>John 3:16</small></div>
    </section>
    <section class="wt-actions">${contactButtons("wt-btn")}</section>
    <section class="wt-row">${actionRow("wt-pill")}</section>
    ${videoBlock("wt-video")}
    <section class="wt-sec">
      <h2>Evidence Locker</h2>
      <div class="wt-grid">${products("wt-prod", 6)}</div>
      <a class="wt-all" href="${CONFIG.shop}" target="_blank" rel="noopener">See all evidence ${I.arrow}</a>
    </section>
    <section class="wt-file">
      <h2>Case File</h2>
      <p>${esc(CONFIG.mission)}</p>
      <p class="wt-stamp">${esc(CONFIG.impact)}</p>
    </section>
    <section class="wt-qr-block">
      <div class="wt-qr" data-qr><div class="qr-mini"></div></div>
      <p>Press the code to open it full screen</p>
    </section>
    <section class="wt-verse"><p>&ldquo;${esc(CONFIG.verseText)}&rdquo;</p><span>${esc(CONFIG.verseRef)}</span></section>
    <section class="wt-social">${socials("wt-soc")}</section>
    ${credit()}
  </article>`;
}

/* ---------- LOOK 4: Revelation ---------- */
function lookRevelation() {
  return `
  <article class="rv">
    <section class="rv-hero">
      <div class="rv-rays"></div>
      <div class="rv-ring"><img src="${CONFIG.logo}" alt="${esc(CONFIG.brand)} logo"></div>
      <h1 class="rv-name">${esc(CONFIG.person)}</h1>
      <p class="rv-title">${esc(CONFIG.title)}</p>
      <p class="rv-brand">${esc(CONFIG.brand)}</p>
      <div class="rv-rule"></div>
      <p class="rv-verse">&ldquo;${esc(CONFIG.verseText)}&rdquo;<span>${esc(CONFIG.verseRef)}</span></p>
    </section>
    <section class="rv-actions">${contactButtons("rv-btn")}</section>
    <section class="rv-row">${actionRow("rv-pill")}</section>
    ${videoBlock("rv-video")}
    <section class="rv-sec">
      <h2>The Collection</h2>
      <div class="rv-scroll">${products("rv-prod")}</div>
      <a class="rv-all" href="${CONFIG.shop}" target="_blank" rel="noopener">Explore the store ${I.arrow}</a>
    </section>
    <section class="rv-mission">
      <h2>Our Calling</h2>
      <p>${esc(CONFIG.mission)}</p>
      <p class="rv-impact">${esc(CONFIG.impact)}</p>
    </section>
    <section class="rv-qr-block" data-qr>
      <div class="rv-qr"><div class="qr-mini"></div></div>
      <p>Press to open full screen</p>
    </section>
    <section class="rv-social">${socials("rv-soc")}</section>
    ${credit()}
  </article>`;
}

const RENDER = { contraband: lookContraband, jersey: lookJersey, wanted: lookWanted, revelation: lookRevelation };

/* ---------- QR ---------- */
function drawQR(el, size, dark, light) {
  el.innerHTML = "";
  if (typeof qrcode === "undefined") { el.textContent = "QR"; return; }
  const qr = qrcode(0, "M");
  qr.addData(CONFIG.cardUrl);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 2;
  const total = n + quiet * 2;
  let path = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) path += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    }
  }
  el.innerHTML = `<svg viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="QR code for ${esc(CONFIG.brand)}" style="width:100%;height:100%;display:block"><rect width="${total}" height="${total}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
}

function openQR() {
  const box = document.getElementById("qrBig");
  const size = Math.min(window.innerWidth - 80, 360);
  box.style.width = size + "px";
  box.style.height = size + "px";
  drawQR(box, size, "#000000", "#ffffff");
  document.getElementById("qrFull").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeQR() {
  document.getElementById("qrFull").hidden = true;
  document.body.style.overflow = "";
}

/* ---------- video (plays inside the card) ---------- */
function embedUrl(u) {
  let m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&playsinline=1&rel=0`;
  m = u.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1&playsinline=1`;
  return "";
}
function openVideo() {
  const src = embedUrl(CONFIG.video);
  if (!src) return;
  document.getElementById("videoFrame").innerHTML = `<iframe src="${src}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
  document.getElementById("videoModal").hidden = false;
}
function closeVideo() {
  document.getElementById("videoFrame").innerHTML = "";
  document.getElementById("videoModal").hidden = true;
}

/* ---------- Save Contact (.vcf) ---------- */
function saveContact() {
  const parts = CONFIG.person.split(" ");
  const last = parts.length > 1 ? parts.pop() : "";
  const first = parts.join(" ");
  const lines = [
    "BEGIN:VCARD", "VERSION:3.0",
    `N:${last};${first};;;`, `FN:${CONFIG.person}`,
    `ORG:${CONFIG.brand}`, `TITLE:${CONFIG.title}`
  ];
  if (CONFIG.phone) lines.push(`TEL;TYPE=CELL:+1${CONFIG.phone}`);
  if (CONFIG.email) lines.push(`EMAIL;TYPE=INTERNET:${CONFIG.email}`);
  lines.push(`URL:${CONFIG.website}`);
  lines.push(`ADR;TYPE=WORK:;;3391 NE Jacksonville Rd;Ocala;FL;34479;USA`);
  if (CONFIG.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${CONFIG.instagram}`);
  lines.push(`NOTE:${CONFIG.mission} ${CONFIG.impact}`);
  lines.push("END:VCARD");
  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "The-Jesus-Cartel.vcf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function shareCard() {
  const data = { title: CONFIG.brand, text: `${CONFIG.brand}: ${CONFIG.mission}`, url: CONFIG.cardUrl };
  if (navigator.share) { try { await navigator.share(data); } catch (e) {} return; }
  try { await navigator.clipboard.writeText(CONFIG.cardUrl); toast("Link copied"); }
  catch (e) { window.prompt("Copy this link:", CONFIG.cardUrl); }
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

/* ---------- picker ---------- */
const QR_COLORS = {
  contraband: ["#0a0a0a", "#f4f1ea"],
  jersey: ["#0b0b0b", "#ffffff"],
  wanted: ["#1d1710", "#efe4c9"],
  revelation: ["#0c0a07", "#f6efdc"]
};

function setLook(id) {
  const look = LOOKS.find(l => l.id === id) || LOOKS[0];
  document.body.dataset.look = look.id;
  document.getElementById("card").innerHTML = RENDER[look.id]();
  document.querySelectorAll(".picker-tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.id === look.id)));
  document.querySelectorAll(".qr-mini").forEach(el => drawQR(el, 132, ...QR_COLORS[look.id]));
  const msg = `Hi Angel! For The Jesus Cartel vCard, I want the "${look.name}" look.`;
  document.getElementById("pickWa").href = `https://wa.me/${CONFIG.angelPhone}?text=${enc(msg)}`;
  document.getElementById("pickSms").href = smsLink(CONFIG.angelPhone, msg);
  try { history.replaceState(null, "", `#${look.id}`); } catch (e) {}
  window.scrollTo({ top: 0 });
}

function buildPicker() {
  document.getElementById("pickerTabs").innerHTML = LOOKS.map((l, i) =>
    `<button class="picker-tab" role="tab" data-id="${l.id}"><b>${i + 1}</b>${l.name}</button>`).join("");
  document.getElementById("pickerTabs").addEventListener("click", e => {
    const t = e.target.closest(".picker-tab");
    if (t) setLook(t.dataset.id);
  });
}

document.addEventListener("click", e => {
  if (e.target.closest("[data-qr]")) { e.preventDefault(); openQR(); }
  else if (e.target.closest("[data-save]")) saveContact();
  else if (e.target.closest("[data-share]")) shareCard();
  else if (e.target.closest("[data-video]")) openVideo();
});
document.getElementById("qrClose").addEventListener("click", closeQR);
document.getElementById("qrFull").addEventListener("click", e => { if (e.target.id === "qrFull") closeQR(); });
document.getElementById("videoClose").addEventListener("click", closeVideo);
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeQR(); closeVideo(); } });

buildPicker();
setLook((location.hash || "").slice(1) || "contraband");
