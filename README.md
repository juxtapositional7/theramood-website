# TheraMood — Website

> **Feel what your body knows.**

Marketing site for **TheraMood**, a wearable wristband + companion app that predicts
emotional state from pulse signals and sleep-quality data, then delivers personalized
recovery guidance when stress, anxiety, or emotional dysregulation is detected.

## 🌐 Live site

**[https://juxtapositional7.github.io/theramood-website/](https://juxtapositional7.github.io/theramood-website/)**

The site is hosted with **GitHub Pages** straight from this repo (branch `main`, root folder) —
no build step needed. Every push to `main` republishes it automatically within a minute or two.

## Run it locally

No build step — it's a static site. Either:

- double-click `index.html`, or
- serve it locally for best results:

```bash
# any static server works, e.g.
python -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html              — the main site (single page)
contact.html            — contact page with hidden admin inbox
css/style.css           — styles, animations, responsive rules
js/main.js              — interactions (tour, breathing demo, counters, parallax)
js/contact.js           — contact form, admin key, message inbox
assets/logo.svg         — logo mark (also used as favicon)
assets/app_screenshots/ — real screenshots from the TheraMood app
assets/hardware/        — photos of the electronics and the 3D-printed case
```

## Contact page & admin inbox

Visitors can send a message (name, email, message) from **contact.html**.
As the owner, you can read every message right on the site:

1. On the contact page, either **type the word `admin`** anywhere on the page,
   or click the **tiny dot** at the very end of the footer's "Not a medical
   device" line.
2. Enter the admin key to unlock the 📥 inbox — read, delete, export (JSON),
   or clear messages. You stay unlocked until you close the tab or hit **Lock**.

**Changing the password:** edit the `ADMIN_KEY` constant at the top of
[`js/contact.js`](js/contact.js) — one line, takes effect on the next page load.

**Two honest limitations** (this is a static site with no server):

- Messages are saved in the **browser's localStorage on the device where they
  were submitted**. You'll see every message sent from a given browser when you
  unlock the inbox in that same browser — great for demo days on one device,
  but a message sent from someone else's laptop stays on their laptop. Wiring
  in a free form service (Formspree/Web3Forms) or Firebase would make messages
  reach you from anywhere.
- The admin key lives in public source code, so it deters casual visitors
  rather than determined ones. Don't reuse a real password here.

## Highlights

- **Logo & slogan** — an ECG pulse line over an ocean-dawn gradient tile; "Feel what your body knows."
- **Interactive app tour** — auto-advancing tabbed showcase of 7 real app screens with crossfade + progress bars
- **Working 4-7-8 breathing demo** — the same exercise the app recommends for anxiety
- **Animated stat counters**, scroll reveals, hero parallax, floating glass cards, live ECG line, seamless marquee
- Fully responsive, and honors `prefers-reduced-motion`

Designed & engineered by Jasmine Liu.
