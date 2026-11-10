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
   and <id>-t.webp (360px thumbnail). Keep the id when replacing a photo. */
window.MENU = [
  { id: "burger", ar: "برگر", en: "Burgers", items: [
    { id: "b1", ar: "الكلاسيك", en: "Double smash beef", p: 9000,
      d: "قطعتين لحم سماش بحواف مقرمشة، جبن شيدر ذايب، صوص البيت، مخلل." },
    { id: "b2", ar: "الكرسبي", en: "Crispy chicken", p: 8000,
      d: "صدر دجاج مقرمش، مايونيز حار، خس، مخلل، بريوش طري." }
  ]},
  { id: "wings", ar: "وينگز", en: "Wings", items: [
    { id: "w1", ar: "بفلو حار", en: "Buffalo · 6 pcs", p: 7000,
      d: "٦ قطع مغطّسة بصوص بفلو، وياها رانش وكرفس." },
    { id: "w2", ar: "عسل وثوم", en: "Honey garlic · 6 pcs", p: 7000,
      d: "٦ قطع بصوص عسل وثوم، سمسم وبصل أخضر، وياها صوص ثوم." }
  ]},
  { id: "fries", ar: "بطاطا", en: "Fries", items: [
    { id: "f1", ar: "كلاسيك", en: "House salt", p: 3000,
      d: "بطاطا بقشرها مقرمشة بملح البحر." },
    { id: "f2", ar: "لودد", en: "Loaded", p: 5000,
      d: "جبن شيدر ذايب، صوص البيت، هالابينو." }
  ]},
  { id: "sweets", ar: "حلويات", en: "Sweets", items: [
    { id: "s1", ar: "كوكي حار", en: "Warm cookie", p: 4000,
      d: "كوكي طالع من الفرن، قطع شوكليت داكن وملح بحري." },
    { id: "s2", ar: "تشيز كيك لوتس", en: "Lotus cheesecake", p: 5000,
      d: "قطعة تشيز كيك، كريمة لوتس وفتات بسكويت." }
  ]},
  { id: "drinks", ar: "مشروبات", en: "Drinks", items: [
    { id: "d1", ar: "بيبسي", en: "Pepsi · can", p: 1000, d: "قوطية باردة." },
    { id: "d2", ar: "سفن أب", en: "7UP · can", p: 1000, d: "قوطية باردة." },
    { id: "d3", ar: "ماي", en: "Water", p: 500, d: "بطل ماي بارد." }
  ]}
];
