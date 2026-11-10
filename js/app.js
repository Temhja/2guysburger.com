/* 2 Guys Burger — menu app (home → item → cart → WhatsApp). Reads SITE + MENU from config.js */
(function () {
  "use strict";
  var S = window.SITE, MENU = window.MENU;
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var money = function (n) { return fmt(n) + "<small>" + S.curLabel + "</small>"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var img = function (id, thumb) { return "assets/img/menu/" + id + (thumb ? "-t" : "") + ".webp"; };
  var ITEMS = {}, CAT = {};
  MENU.forEach(function (c) { c.items.forEach(function (it, k) { ITEMS[it.id] = it; CAT[it.id] = c; it.no = String(k + 1).padStart(2, "0"); }); });

  /* ---------- storage (cart survives a trip to WhatsApp) ---------- */
  var cart = new Map(), curId = null, qty = 1, code = "", checkoutTracked = false;
  function save() { try { localStorage.setItem("2g_cart", JSON.stringify([...cart])); } catch (e) {} }
  try { JSON.parse(localStorage.getItem("2g_cart") || "[]").forEach(function (r) { if (ITEMS[r[0]] && r[1] > 0) cart.set(r[0], r[1]); }); } catch (e) {}

  /* ---------- ad source (UTM / fbclid) → shown to the cashier in the order ---------- */
  var src = {};
  try {
    var qs = new URLSearchParams(location.search);
    ["utm_source", "utm_campaign", "utm_content"].forEach(function (k) { if (qs.get(k)) src[k] = qs.get(k).slice(0, 60); });
    if (qs.get("fbclid")) src.fbclid = 1;
    if (Object.keys(src).length) sessionStorage.setItem("2g_src", JSON.stringify(src));
    else src = JSON.parse(sessionStorage.getItem("2g_src") || "{}");
  } catch (e) {}
  function sourceLine() {
    var parts = [src.utm_source, src.utm_campaign, src.utm_content].filter(Boolean);
    if (parts.length) return "المصدر: " + parts.join(" / ");
    if (src.fbclid) return "المصدر: إعلان فيسبوك/انستغرام";
    return "";
  }

  /* ---------- pixel helpers ---------- */
  var T = function (ev, p, custom) { if (window.track) window.track(ev, p, custom); };
  function cartPayload() {
    var t = totals();
    return {
      content_ids: [...cart.keys()], content_type: "product",
      contents: [...cart].map(function (r) { return { id: r[0], quantity: r[1], item_price: ITEMS[r[0]].p }; }),
      num_items: t.c, value: t.t, currency: S.currency
    };
  }

  /* ---------- static bits from config ---------- */
  if (S.badge) $("heroTag").textContent = S.badge; else $("heroTag").hidden = true;
  $("phoneTxt").textContent = S.phones[0];
  $("contact").innerHTML =
    S.phones.map(function (p) { return '<a href="tel:' + p + '">' + p + "</a>"; }).join("") +
    '<a href="https://www.instagram.com/' + S.instagram + '/" target="_blank" rel="noopener">@' + S.instagram + "</a>";

  /* ---------- structured data: menu (built from config so prices stay in one place) ---------- */
  var ld = document.createElement("script"); ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "Menu", "@id": S.url + "/#menu", "name": "منيو " + S.name, "inLanguage": "ar",
    "hasMenuSection": MENU.map(function (c) {
      return { "@type": "MenuSection", "name": c.ar, "hasMenuItem": c.items.map(function (i) {
        return { "@type": "MenuItem", "name": i.ar, "alternateName": i.en, "description": i.d, "image": S.url + "/" + img(i.id),
          "offers": { "@type": "Offer", "price": i.p, "priceCurrency": S.currency } };
      }) };
    })
  });
  document.head.appendChild(ld);

  /* ---------- home ---------- */
  var plusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  $("pills").innerHTML = MENU.map(function (c, i) { return '<button type="button" data-to="' + c.id + '" aria-pressed="' + (i === 0) + '">' + c.ar + "</button>"; }).join("");
  $("menu").innerHTML = MENU.map(function (c) {
    var pair = c.items.length === 2;
    return '<section class="cat" id="cat-' + c.id + '" aria-labelledby="h-' + c.id + '">' +
      '<div class="cat-h"><h2 id="h-' + c.id + '">' + c.ar + '</h2><span class="vs">' + (pair ? "<b>01</b> لو <b>02</b>" : c.en) + "</span></div>" +
      '<div class="grid' + (c.items.length === 3 ? " three" : "") + '">' +
      c.items.map(function (i) {
        return '<div class="card">' +
          '<span class="ph"><img src="' + img(i.id, 1) + '" alt="' + esc(i.ar + " – " + i.en) + '" loading="lazy" decoding="async" width="360" height="360"></span>' +
          (pair ? '<span class="no">' + i.no + "</span>" : "") +
          '<h3><a class="lk" href="#' + i.id + '">' + i.ar + '</a></h3><p class="en">' + i.en + "</p>" +
          '<div class="ft"><span class="num">' + money(i.p) + '</span><button type="button" class="plus" data-quick="' + i.id + '" aria-label="ضيف ' + esc(i.ar) + '">' + plusIcon + "</button></div>" +
          "</div>";
      }).join("") + "</div></section>";
  }).join("");

  $("pills").addEventListener("click", function (e) { var b = e.target.closest("[data-to]"); if (b) $("cat-" + b.dataset.to).scrollIntoView({ behavior: "smooth" }); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting) return; var id = en.target.id.slice(4);
      document.querySelectorAll("#pills button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.to === id); }); }); }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".cat").forEach(function (s) { io.observe(s); });
  }
  $("menu").addEventListener("click", function (e) {
    var q = e.target.closest("[data-quick]"); if (!q) return;
    e.preventDefault(); add(q.dataset.quick, 1); toast("انضاف " + ITEMS[q.dataset.quick].ar);
  });
  function quick() { document.querySelectorAll("[data-quick]").forEach(function (b) { var n = cart.get(b.dataset.quick) || 0; b.classList.toggle("on", n > 0); b.innerHTML = n ? n : plusIcon; }); }

  /* ---------- item ---------- */
  function showItem(id) {
    var it = ITEMS[id], c = CAT[id]; if (curId !== id) qty = 1; curId = id;
    $("crumb").textContent = c.en.toUpperCase() + " · " + it.no + " / " + String(c.items.length).padStart(2, "0");
    $("stage").innerHTML = '<div class="enter"><img class="spin" src="' + img(id) + '" alt="' + esc(it.ar + " – " + it.en) + '" width="900" height="900"></div>';
    $("sw").innerHTML = c.items.map(function (x, k) { return (k ? "<i>لو</i>" : "") + '<button type="button" data-go="' + x.id + '" aria-current="' + (x.id === id) + '" aria-label="' + esc(x.ar) + '">' + x.no + "</button>"; }).join("");
    $("iName").textContent = it.ar; $("iEn").textContent = it.en; $("iDesc").textContent = it.d;
    $("bothBtn").hidden = c.items.length !== 2; qtyUI();
    document.title = it.ar + " · " + S.name;
    T("ViewContent", { content_ids: [id], content_name: it.en, content_category: c.en, content_type: "product", value: it.p, currency: S.currency });
  }
  function qtyUI() { $("qVal").textContent = qty; $("iTot").innerHTML = money(qty * ITEMS[curId].p); }
  $("sw").addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b && b.dataset.go !== curId) location.replace("#" + b.dataset.go); });
  $("qPlus").onclick = function () { qty = Math.min(20, qty + 1); qtyUI(); };
  $("qMinus").onclick = function () { qty = Math.max(1, qty - 1); qtyUI(); };
  $("addBtn").onclick = function () { add(curId, qty); toast("انضاف " + qty + " × " + ITEMS[curId].ar); };
  $("bothBtn").onclick = function () { CAT[curId].items.forEach(function (x) { add(x.id, qty); }); toast("انضاف الثنين للسلة"); };

  /* ---------- cart ---------- */
  function add(id, n) {
    cart.set(id, (cart.get(id) || 0) + n); save(); badge(true); quick();
    T("AddToCart", { content_ids: [id], content_name: ITEMS[id].en, content_type: "product", contents: [{ id: id, quantity: n, item_price: ITEMS[id].p }], value: ITEMS[id].p * n, currency: S.currency });
  }
  function totals() { var c = 0, t = 0; cart.forEach(function (q, id) { c += q; t += q * ITEMS[id].p; }); return { c: c, t: t }; }
  function badge(pop) {
    var t = totals(), b = $("badge"); b.textContent = t.c; $("navTot").innerHTML = money(t.t);
    if (pop) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  }
  function renderCart() {
    var t = totals(); $("cartFull").hidden = !t.c; $("cartEmpty").hidden = !!t.c; if (!t.c) return;
    if (!code) code = "2G-" + String(Math.floor(1000 + Math.random() * 9000));
    $("cl").innerHTML = [...cart].map(function (r) { var id = r[0], q = r[1], i = ITEMS[id];
      return '<div class="ci"><img src="' + img(id, 1) + '" alt="" width="60" height="60"><div><h3>' + i.ar + '</h3><span class="num">' + money(i.p * q) + "</span></div>" +
        '<span class="step"><button type="button" data-dec="' + id + '" aria-label="نقّص ' + esc(i.ar) + '">−</button><span>' + q + '</span><button type="button" data-inc="' + id + '" aria-label="زيد ' + esc(i.ar) + '">+</button></span></div>'; }).join("");
    $("sCount").textContent = t.c + " قطعة"; $("sSub").innerHTML = money(t.t); $("sTot").innerHTML = money(t.t); $("oCode").textContent = "ORDER #" + code; link();
  }
  $("cl").addEventListener("click", function (e) {
    var i = e.target.closest("[data-inc]"), d = e.target.closest("[data-dec]");
    if (i) cart.set(i.dataset.inc, cart.get(i.dataset.inc) + 1);
    if (d) { var id = d.dataset.dec, q = cart.get(id) - 1; if (q > 0) cart.set(id, q); else cart.delete(id); }
    if (i || d) { save(); badge(false); renderCart(); quick(); }
  });
  $("clearBtn").onclick = function () { cart.clear(); code = ""; save(); badge(false); renderCart(); quick(); };

  var isDel = function () { return $("tDel").checked; };
  function message() {
    var m = ["هلا 2 Guys، طلب جديد #" + code, ""]
      .concat([...cart].map(function (r) { return "• " + r[1] + " × " + ITEMS[r[0]].ar + " — " + fmt(r[1] * ITEMS[r[0]].p); }))
      .concat(["", "المجموع: " + fmt(totals().t) + " " + S.curLabel + " (بدون التوصيل)", "النوع: " + (isDel() ? "توصيل" : "استلام"), "الاسم: " + $("fName").value.trim()]);
    if (isDel()) m.push("العنوان: " + $("fAddr").value.trim());
    var n = $("fNote").value.trim(); if (n) m.push("ملاحظات: " + n);
    var s = sourceLine(); if (s) m.push("", s);
    return m.join("\n");
  }
  function link() { $("waBtn").href = "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(message()); }
  function validate() {
    if (!$("fName").value.trim()) return "اكتب اسمك حتى نعرف الطلب منو.";
    if (isDel() && !$("fAddr").value.trim()) return "اكتب المنطقة وأقرب نقطة دالة حتى يوصلك الدلفري.";
    return "";
  }
  function showErr(v) { $("err").textContent = v; $("err").hidden = false; }
  $("form").addEventListener("input", function () { $("addrWrap").hidden = !isDel(); $("err").hidden = true; link(); });
  $("form").addEventListener("submit", function (e) { e.preventDefault(); });
  $("waBtn").addEventListener("click", function (e) {
    var v = validate(); if (v) { e.preventDefault(); showErr(v); return; }
    link();
    var p = cartPayload(); p.order_type = isDel() ? "delivery" : "pickup";
    T("Lead", p); T("Contact", { value: p.value, currency: S.currency }); T("WhatsAppOrder", p, true);
    toast("كمّل الإرسال بالواتساب");
  });
  $("copyBtn").addEventListener("click", function () {
    var v = validate(); if (v) { showErr(v); return; }
    var b = $("copyBtn"), fail = function () { b.textContent = "ما انْسخ، صوّر الفاتورة"; };
    try { navigator.clipboard.writeText(message()).then(function () { b.textContent = "تم النسخ ✓"; }, fail); } catch (e) { fail(); }
  });

  /* ---------- toast + routing ---------- */
  var tt;
  function toast(s) { var t = $("toast"); t.textContent = s; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("on"); }, 1700); }
  var HOME_TITLE = document.title;
  function route() {
    var h = decodeURIComponent(location.hash.slice(1)), view = h === "cart" ? "cart" : ITEMS[h] ? "item" : "home";
    ["home", "item", "cart"].forEach(function (v) { $("v-" + v).hidden = v !== view; });
    $("navHome").setAttribute("aria-current", view === "home");
    if (view === "item") showItem(h); else document.title = HOME_TITLE;
    if (view === "cart") { renderCart(); if (cart.size && !checkoutTracked) { checkoutTracked = true; T("InitiateCheckout", cartPayload()); } }
    else checkoutTracked = false;
    window.scrollTo(0, 0);
  }
  $("navHome").onclick = function () { location.hash = "home"; };
  $("navCart").onclick = function () { location.hash = "cart"; };
  window.addEventListener("hashchange", route);
  badge(false); quick(); route();
})();
