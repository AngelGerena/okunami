/* OKUNAMI agent embed. Add ONE line to any card:
   <script src="https://okunami.pro/agent-embed.js" data-key="YOUR_SITE_KEY" data-accent="#c9a24b" defer></script>
   Works on OKUNAMI cards and on standalone cards hosted anywhere. The key is public; the service checks the card's address. */
(function () {
  var s = document.currentScript; if (!s) return;
  var key = s.getAttribute('data-key'); if (!key) return;
  var accent = s.getAttribute('data-accent') || '#1f2937';
  var API = s.getAttribute('data-api') || 'https://hrwzzpmltpsqyynmmeof.supabase.co/functions/v1/agent-chat';
  var es = ((s.getAttribute('data-lang') || document.documentElement.lang || navigator.language || 'en') + '').toLowerCase().indexOf('es') === 0;
  var T = es ? { open: 'Chatea con nosotros', ph: 'Escribe tu pregunta', send: 'Enviar', close: 'Cerrar', err: 'No se pudo enviar. Intenta de nuevo.', hi: 'Hola, ¿en qué te puedo ayudar?' }
             : { open: 'Chat with us', ph: 'Type your question', send: 'Send', close: 'Close', err: 'Could not send. Please try again.', hi: 'Hi, how can I help?' };
  var vid = ''; try { vid = localStorage.getItem('ag_v') || ''; if (!vid) { vid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('ag_v', vid); } } catch (e) { vid = 'anon'; }
  var history = [];

  var css = '.agw{position:fixed;right:16px;bottom:16px;z-index:2147483000;font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:calc(100vw - 32px)}' +
    '.agw *{box-sizing:border-box}.agw button{font:inherit;cursor:pointer}' +
    '.agw-fab{background:' + accent + ';color:#fff;border:0;border-radius:999px;padding:12px 18px;box-shadow:0 6px 20px rgba(0,0,0,.25)}' +
    '.agw-box{display:none;width:340px;max-width:calc(100vw - 32px);height:420px;max-height:calc(100vh - 100px);background:#fff;color:#111;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.3);overflow:hidden;flex-direction:column}' +
    '.agw.open .agw-box{display:flex}.agw.open .agw-fab{display:none}' +
    '.agw-head{background:' + accent + ';color:#fff;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}' +
    '.agw-head button{background:none;border:0;color:#fff;font-size:14px}' +
    '.agw-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;overflow-wrap:anywhere}' +
    '.agw-m{padding:8px 12px;border-radius:12px;max-width:85%;white-space:pre-wrap}' +
    '.agw-u{align-self:flex-end;background:' + accent + ';color:#fff}.agw-a{align-self:flex-start;background:#f1f1f1}' +
    '.agw-form{display:flex;gap:6px;padding:10px;border-top:1px solid #e5e5e5}' +
    '.agw-form input{flex:1;min-width:0;border:1px solid #ccc;border-radius:10px;padding:9px;font:inherit;font-size:16px}' +
    '.agw-form button{background:' + accent + ';color:#fff;border:0;border-radius:10px;padding:9px 14px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var w = document.createElement('div'); w.className = 'agw';
  w.innerHTML = '<button class="agw-fab" type="button"></button><div class="agw-box" role="dialog" aria-label="Chat"><div class="agw-head"><span></span><button type="button" class="agw-x"></button></div><div class="agw-log" aria-live="polite"></div><form class="agw-form"><input type="text" maxlength="500" autocomplete="off"><button type="submit"></button></form></div>';
  document.body.appendChild(w);
  var $ = function (q) { return w.querySelector(q); };
  $('.agw-fab').textContent = T.open; $('.agw-head span').textContent = T.open; $('.agw-x').textContent = T.close;
  $('.agw-form input').placeholder = T.ph; $('.agw-form button').textContent = T.send;
  var log = $('.agw-log');
  function add(t, who) { var d = document.createElement('div'); d.className = 'agw-m ' + (who === 'u' ? 'agw-u' : 'agw-a'); d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  $('.agw-fab').onclick = function () { w.classList.add('open'); if (!log.children.length) add(T.hi, 'a'); $('.agw-form input').focus(); };
  $('.agw-x').onclick = function () { w.classList.remove('open'); };
  var busy = false;
  $('.agw-form').onsubmit = function (e) {
    e.preventDefault(); var inp = $('.agw-form input'), q = inp.value.trim(); if (!q || busy) return;
    inp.value = ''; add(q, 'u'); history.push({ role: 'user', content: q }); busy = true;
    var wait = add('...', 'a');
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: key, visitor: vid, messages: history.slice(-12) }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { var t = (j && j.reply) || T.err; wait.textContent = t; history.push({ role: 'assistant', content: t }); })
      .catch(function () { wait.textContent = T.err; history.pop(); })
      .then(function () { busy = false; log.scrollTop = log.scrollHeight; });
  };
})();
