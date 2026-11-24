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

  /* ---------- offers: cart ids look like o2-<classic>-<truffle>-<wing id> ---------- */
  var OF = (window.OFFERS && OFFERS.on) ? OFFERS.list : [];
  var OFB = {}; OF.forEach(function (o) { OFB[o.id] = o; });
  var BUR = (MENU.filter(function (c) { return c.id === "burger"; })[0] || { items: [] }).items;
  function offerItem(id) {
    if (ITEMS[id]) return ITEMS[id];
    var m = /^(o\d)-(\d)-(\d)-(w\d)$/.exec(id), o = m && OFB[m[1]]; if (!o || !ITEMS[m[4]]) return null;
    var cnt = [+m[2], +m[3]]; if (cnt[0] + cnt[1] !== o.n) return null;
    var parts = [], p = 0;
    BUR.slice().sort(function (x, y) { return x.p - y.p; }).forEach(function (b, k) { if (cnt[k]) { parts.push(cnt[k] + " " + b.ar); p += cnt[k] * b.p; } });
    var free = o.free.map(function (f) { return f === "wings" ? ITEMS[m[4]].ar : ITEMS[f] ? ITEMS[f].ar : ""; }).filter(Boolean);
    return (ITEMS[id] = { id: id, offer: true, ar: o.title + ": " + parts.join(" + ") + " + " + free.join(" + ") + " مجاناً", en: o.title, p: p, thumb: img(BUR[0] ? BUR[0].id : "b1", 1) });
  }

  /* ---------- storage (cart survives a trip to WhatsApp) ---------- */
  var cart = new Map(), curId = null, qty = 1, code = "", checkoutTracked = false;
  function save() { try { localStorage.setItem("2g_cart", JSON.stringify([...cart])); } catch (e) {} }
  try { JSON.parse(localStorage.getItem("2g_cart") || "[]").forEach(function (r) { if ((ITEMS[r[0]] || offerItem(r[0])) && r[1] > 0) cart.set(r[0], r[1]); }); } catch (e) {}

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
  var T = function (ev, p, custom) { if (window.track) window.track(ev, p, custom); if (window.gaTrack) window.gaTrack(ev, p); };
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
        return { "@type": "MenuItem", "name": i.ar, "alternateName": i.en, "description": i.d || undefined, "image": S.url + "/" + img(i.id),
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
      '<div class="cat-h"><h2 id="h-' + c.id + '">' + c.ar + '</h2><span class="vs">' + (pair ? "<b>01</b> لو <b>02</b>" : c.en.toUpperCase()) + "</span></div>" +
      '<div class="grid' + (c.items.length === 3 ? " three" : c.items.length === 1 ? " one" : "") + '">' +
      c.items.map(function (i) {
        return '<div class="card">' +
          '<span class="ph"><img src="' + img(i.id, 1) + '" alt="' + esc(i.ar + " – " + i.en) + '" loading="lazy" decoding="async" width="360" height="360"></span>' +
          (pair ? '<span class="no">' + i.no + "</span>" : "") +
          '<div class="body"><h3><a class="lk" href="#' + i.id + '">' + i.ar + '</a></h3><p class="en">' + i.en + "</p>" +
          '<div class="ft"><span class="num">' + money(i.p) + '</span><button type="button" class="plus" data-quick="' + i.id + '" aria-label="ضيف ' + esc(i.ar) + '">' + plusIcon + "</button></div></div>" +
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
    $("iName").textContent = it.ar; $("iEn").textContent = it.en; $("iDesc").textContent = it.d || ""; $("iDesc").hidden = !it.d;
    $("sw").hidden = c.items.length < 2;
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
      return '<div class="ci"><img src="' + (i.thumb || img(id, 1)) + '" alt="" width="60" height="60"><div><h3>' + i.ar + '</h3><span class="num">' + money(i.p * q) + "</span></div>" +
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

  /* ---------- offers popup ---------- */
  if (OF.length) {
    var WINGS = (CAT.w1 || { items: [] }).items, cheap = BUR.slice().sort(function (x, y) { return x.p - y.p; });
    var pick = {};
    var freeTxt = function (o) { return o.free.map(function (f) { return f === "wings" ? "أجنحة" : ITEMS[f] ? ITEMS[f].ar : ""; }).join(" + "); };
    var dlg = document.createElement("div"); dlg.className = "ofr"; dlg.hidden = true; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "ofrH");
    dlg.innerHTML = '<div class="ofr-bg" data-x></div><div class="ofr-box"><div class="ofr-top"><div><p class="ofr-k">OFFERS</p><h2 id="ofrH">عروض <em><bdi dir="ltr">2 Guys</bdi></em></h2></div><button type="button" class="ofr-x" data-x><span aria-hidden="true">×</span>اغلق</button></div>' +
      '<p class="ofr-s">اختار البرگر من أي نوع، والباقي علينا.</p>' +
      OF.map(function (o) {
        pick[o.id] = { c: [o.n, 0], w: WINGS[0] ? WINGS[0].id : "w1" };
        var thumbs = []; for (var k = 0; k < o.n; k++) thumbs.push('<img src="' + img(cheap[k % cheap.length].id, 1) + '" alt="" width="64" height="64">');
        o.free.forEach(function (f) { thumbs.push('<span class="fr"><img src="' + img(f === "wings" ? (WINGS[0] || {}).id : f, 1) + '" alt="" width="64" height="64"><b>مجاناً</b></span>'); });
        return '<div class="ofc" data-o="' + o.id + '"><div class="ofc-h"><span class="ofc-n">' + o.n + '</span><div><h3>' + (o.head || o.title) + '</h3><p>' + cheap.map(function (b) { return b.ar; }).join(" لو ") + '، لو تخلط بيناتهم</p></div></div>' +
          '<div class="ofc-im">' + thumbs.join("") + '</div>' +
          '<div class="ofc-pk">' + cheap.map(function (b, k) { return '<div class="rowx"><span>' + b.ar + '</span><span class="step"><button type="button" data-oc="' + o.id + ':' + k + ':-1" aria-label="نقّص ' + esc(b.ar) + '">−</button><span data-ov="' + o.id + ':' + k + '"></span><button type="button" data-oc="' + o.id + ':' + k + ':1" aria-label="زيد ' + esc(b.ar) + '">+</button></span></div>'; }).join("") +
          (o.free.indexOf("wings") > -1 && WINGS.length > 1 ? '<div class="ofc-w" role="radiogroup" aria-label="نوع الأجنحة">' + WINGS.map(function (w) { return '<button type="button" data-ow="' + o.id + ':' + w.id + '">' + w.ar + '</button>'; }).join("") + '</div>' : "") +
          '</div><div class="ofc-ft"><span class="num" data-op="' + o.id + '"></span><button type="button" class="btn" data-oa="' + o.id + '">اختار</button></div></div>';
      }).join("") + '<p class="ofr-n">تدفع سعر البرگر بس. التوصيل حسب منطقتك.</p><button type="button" class="ofr-close" data-x>اغلق</button></div>';
    document.body.appendChild(dlg);
    var oUI = function () {
      OF.forEach(function (o) { var s = pick[o.id];
        s.c.forEach(function (n, k) { var e = dlg.querySelector('[data-ov="' + o.id + ':' + k + '"]'); if (e) e.textContent = n; });
        dlg.querySelectorAll('[data-ow^="' + o.id + ':"]').forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.ow.split(":")[1] === s.w); });
        var it = offerItem(o.id + "-" + s.c.join("-") + "-" + s.w); dlg.querySelector('[data-op="' + o.id + '"]').innerHTML = money(it.p);
      });
    };
    var lastFocus;
    var openOffers = function (auto) { lastFocus = document.activeElement; dlg.hidden = false; document.documentElement.classList.add("lock"); dlg.querySelectorAll(".ofc").forEach(function (c) { c.classList.remove("open"); c.querySelector("[data-oa]").textContent = "اختار"; }); oUI(); var bx = dlg.querySelector(".ofr-box"); bx.tabIndex = -1; bx.focus({ preventScroll: true });
      T("ViewOffers", { auto: !!auto }, true); try { sessionStorage.setItem("2g_ofr", "1"); } catch (e) {} };
    var closeOffers = function () { dlg.hidden = true; document.documentElement.classList.remove("lock"); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    dlg.addEventListener("click", function (e) {
      var t = e.target, b;
      if (t.closest("[data-x]")) return closeOffers();
      if ((b = t.closest("[data-oc]"))) { var q = b.dataset.oc.split(":"), s = pick[q[0]], k = +q[1], d = +q[2], o2 = 1 - k;
        if (s.c[k] + d < 0 || s.c[k] + d > OFB[q[0]].n) return; s.c[k] += d; s.c[o2] -= d; if (s.c[o2] < 0) { s.c[o2] = 0; s.c[k] = OFB[q[0]].n; } oUI(); }
      if ((b = t.closest("[data-ow]"))) { var w = b.dataset.ow.split(":"); pick[w[0]].w = w[1]; oUI(); }
      if ((b = t.closest("[data-oa]")) && !b.closest(".ofc").classList.contains("open")) {
        dlg.querySelectorAll(".ofc").forEach(function (c) { var on = c === b.closest(".ofc"); c.classList.toggle("open", on); c.querySelector("[data-oa]").textContent = on ? "ضيف العرض" : "اختار"; });
        return; }
      if ((b = t.closest("[data-oa]"))) { var s2 = pick[b.dataset.oa], id = b.dataset.oa + "-" + s2.c.join("-") + "-" + s2.w; offerItem(id); add(id, 1); closeOffers(); toast("انضاف " + OFB[b.dataset.oa].title + " للسلة"); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !dlg.hidden) closeOffers(); });
    var ob = document.createElement("button"); ob.type = "button"; ob.className = "ofr-btn"; ob.innerHTML = "<span>العروض</span><b>" + OF.length + "</b>";
    ob.onclick = function () { openOffers(false); };
    document.querySelector(".hero .tx").insertBefore(ob, document.querySelector(".hero h1"));
    var nb = document.createElement("button"); nb.type = "button"; nb.className = "o"; nb.id = "navOffers"; nb.setAttribute("aria-haspopup", "dialog");
    nb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 4 8.5 4 6 6.5 8 8M12 8s1.5-4 3.5-4S18 6.5 16 8"/></svg>عروض';
    nb.onclick = function () { openOffers(false); };
    $("navHome").insertAdjacentElement("afterend", nb);
    var seen = false; try { seen = sessionStorage.getItem("2g_ofr") === "1"; } catch (e) {}
    if (!seen) setTimeout(function () { if (!$("v-home").hidden && dlg.hidden) openOffers(true); }, 1400);
  }

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
