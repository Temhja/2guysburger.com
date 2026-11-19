/* Google Analytics 4 — visitors, sources (UTM / QR / ads), item views and the WhatsApp funnel.
   Turned on by SITE.ga4Id in config.js. Mirrors the Meta Pixel events from app.js:
   ViewContent → view_item · AddToCart → add_to_cart · InitiateCheckout → begin_checkout · Lead → generate_lead */
(function () {
  var id = window.SITE && String(window.SITE.ga4Id || "").trim();
  window.gaTrack = function () {};
  if (!/^G-[A-Z0-9]{4,}$/i.test(id)) return;

  var s = document.createElement("script"); s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);

  // The menu changes "pages" with #hash (#b1, #cart…) — count each as a page view.
  window.addEventListener("hashchange", function () {
    gtag("event", "page_view", { page_location: location.href, page_title: document.title });
  });

  var MAP = { ViewContent: "view_item", AddToCart: "add_to_cart", InitiateCheckout: "begin_checkout", Lead: "generate_lead" };
  window.gaTrack = function (ev, p) {
    var name = MAP[ev]; if (!name) return;
    p = p || {};
    var items = (p.contents || (p.content_ids || []).map(function (i) { return { id: i, quantity: 1 }; })).map(function (c) {
      return { item_id: c.id, item_name: p.content_name || c.id, quantity: c.quantity || 1, price: c.item_price };
    });
    try { gtag("event", name, { currency: p.currency || "IQD", value: p.value || 0, items: items, order_type: p.order_type }); } catch (e) {}
  };
})();
