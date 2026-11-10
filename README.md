# 2guysburger.com

Online menu for **2 Guys Burger** (ساحة الواثق، بغداد). Customers build an order and send it straight to the restaurant's WhatsApp. Built by HUS Office.

Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages.

## Folder structure

```
index.html            page markup + SEO, Open Graph, Restaurant schema
404.html              redirects unknown URLs to the menu
css/style.css         all styles (brand: green #193F32, coral #E6624D)
js/config.js          ← EDIT THIS: WhatsApp number, phones, Pixel ID, menu, prices
js/pixel.js           Meta Pixel loader + event helper
js/app.js             menu, item page, cart, WhatsApp message
assets/img/hero.webp  home hero photo
assets/img/menu/      one photo per item: <id>.webp (900px) + <id>-t.webp (360px thumb)
assets/img/og-image.jpg  link preview image (1200×630)
assets/icons/         favicon, app icons
assets/brand/         logo files
CNAME                 custom domain for GitHub Pages
robots.txt, sitemap.xml, site.webmanifest
```

## Common edits (all in `js/config.js`)

| Task | What to change |
|---|---|
| Change a price or name | `MENU` → the item's `p` (price in IQD) / `ar` / `en` / `d` |
| Change the WhatsApp that receives orders | `whatsapp` (format `9647XXXXXXXXX`, no +, no leading 0) |
| Turn on Meta Pixel | `metaPixelId: "1234567890"` |
| Remove the "SOFT OPENING" badge | `badge: ""` |
| Replace a photo | overwrite `assets/img/menu/<id>.webp` and `<id>-t.webp`, same file names |

Photos must be **top-down (90°), square, transparent background, dish centred**, or the spin effect looks off.

## Meta Pixel events

| Event | When |
|---|---|
| PageView | page load |
| ViewContent | item page opened |
| AddToCart | item added |
| InitiateCheckout | cart opened |
| Lead + Contact + custom `WhatsAppOrder` | customer taps "دز الطلب على الواتساب" |

Optimise sales campaigns for **Lead**. The order is completed inside WhatsApp, so the site never sees a confirmed Purchase.

## Ad links

Add UTMs to ad URLs, e.g. `https://2guysburger.com/?utm_source=ig&utm_campaign=launch&utm_content=smash-reel#b1`.
The source is added to the bottom of the WhatsApp order ("المصدر: ig / launch / smash-reel") so the cashier can see which ad brought it.
Item deep links: `#b1 #b2 #w1 #w2 #f1 #f2 #s1 #s2 #d1 #d2 #d3`, cart: `#cart`.

## DNS (at the domain registrar)

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | temhja.github.io |

Then in GitHub → Settings → Pages, tick **Enforce HTTPS** once the certificate is issued.
