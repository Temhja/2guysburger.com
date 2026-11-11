/* =========================================================
   2 Guys Burger — site settings + menu
   Edit this file only. Prices are in Iraqi dinar (IQD).
   ========================================================= */
window.SITE = {
  name: "2 Guys Burger",
  url: "https://2guysburger.com",

  // WhatsApp that receives orders: international format, no +, no spaces, no leading 0
  // 07762272227  ->  9647762272227
  whatsapp: "9647762272227",
  phones: ["07762272227", "07812228228"],
  instagram: "2guys.burger",

  currency: "IQD",      // sent to Meta Pixel
  curLabel: "د.ع",      // shown on the page

  // Meta Pixel: paste the Pixel ID from Events Manager (numbers only). Empty = pixel off.
  metaPixelId: "",

  // Small badge on the hero photo. Set to "" to hide it after launch.
  badge: "SOFT OPENING · 15.11"
};

/* Images live in assets/img/menu/<id>.webp (large, spins on item page)
   and <id>-t.webp (360px thumbnail). Keep the id when replacing a photo.
   d: short description (optional — leave "" to hide it). */
window.MENU = [
  { id: "burger", ar: "برگر", en: "Burgers", items: [
    { id: "b1", ar: "ترفل برگر", en: "Truffle burger", p: 10000, d: "" },
    { id: "b2", ar: "كلاسيك برگر", en: "Classic burger", p: 8000, d: "" }
  ]},
  { id: "wings", ar: "أجنحة", en: "Wings", items: [
    { id: "w1", ar: "أجنحة بافلو", en: "Buffalo wings", p: 6000, d: "" },
    { id: "w2", ar: "أجنحة هني ماسترد", en: "Honey mustard wings", p: 6000, d: "" }
  ]},
  { id: "fries", ar: "بطاطا", en: "Fries", items: [
    { id: "f1", ar: "كيرلي فرايز", en: "Curly fries", p: 4000, d: "" }
  ]},
  { id: "sweets", ar: "حلويات", en: "Sweets", items: [
    { id: "s1", ar: "ابل پاي", en: "Apple pie", p: 3000, d: "" },
    { id: "s2", ar: "كريم پف", en: "Cream puff", p: 3000, d: "" }
  ]},
  { id: "drinks", ar: "مشروبات", en: "Drinks", items: [
    { id: "d1", ar: "فلوت", en: "Float", p: 5000, d: "" }
    // Pepsi: add when the price is confirmed, e.g.
    // ,{ id: "d2", ar: "ببسي", en: "Pepsi", p: 1000, d: "" }   (needs assets/img/menu/d2.webp + d2-t.webp)
  ]}
];
