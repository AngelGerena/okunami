/* Back office settings for this card. The anon key is public by design; every private
   action is checked on the server with the owner's session token. */
window.CB_CONFIG = {
  url: "https://hrwzzpmltpsqyynmmeof.supabase.co",
  anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyd3p6cG1sdHBzcXl5bm1tZW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MzE5MzIsImV4cCI6MjEwNjMwNzkzMn0.ow0CSZg0PkEv-rJ28Ggj2WkvzRrKQ0oI_V-GW6fFxlo",
  slug: "noraangel",
  owners: [{ id: "angel", name: "Angel" }, { id: "nora", name: "Nora" }],
  /* Team Google Drive folder mirrored in the Library */
  driveRoot: "1Wp-sJA50Le6g3mI_rdxj1soE7nu-yw-V",
  driveRootName: "Summit Networkers Team - Marketing",
  /* Google API key (Drive API, restricted to noraangel.okunami.pro). Empty = use the saved copy. */
  googleKey: "AIzaSyBoqvEt3QhMk9TWEPXK1O_my4XiNJ-Cf90"
};
window.cbRpc = function (fn, args) {
  var c = window.CB_CONFIG;
  return fetch(c.url + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: { "apikey": c.anon, "Authorization": "Bearer " + c.anon, "Content-Type": "application/json" },
    body: JSON.stringify(args || {})
  }).then(function (r) {
    return r.text().then(function (t) {
      var d = null; try { d = t ? JSON.parse(t) : null; } catch (e) {}
      if (!r.ok) { var err = new Error((d && (d.message || d.error)) || ("HTTP " + r.status)); err.status = r.status; throw err; }
      return d;
    });
  });
};
