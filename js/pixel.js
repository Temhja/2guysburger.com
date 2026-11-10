/* Meta Pixel loader + a safe track() helper.
   Fires: PageView (load), ViewContent (item page), AddToCart, InitiateCheckout (cart opened),
   Lead + Contact + custom WhatsAppOrder (order sent to WhatsApp). */
(function () {
  var id = window.SITE && String(window.SITE.metaPixelId || "").trim();
  window.track = function () {};
  if (!/^\d{6,20}$/.test(id)) return;

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", id);
  fbq("track", "PageView");

  window.track = function (event, params, custom) {
    try { custom ? fbq("trackCustom", event, params || {}) : fbq("track", event, params || {}); } catch (e) {}
  };
})();
