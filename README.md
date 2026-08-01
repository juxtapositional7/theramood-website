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
index.html              — the whole site (single page)
css/style.css           — styles, animations, responsive rules
js/main.js              — interactions (tour, breathing demo, counters, parallax)
assets/logo.svg         — logo mark (also used as favicon)
assets/app_screenshots/ — real screenshots from the TheraMood app
assets/hardware/        — photos of the electronics and the 3D-printed case
```

## Highlights

- **Logo & slogan** — an ECG pulse line over an ocean-dawn gradient tile; "Feel what your body knows."
- **Interactive app tour** — auto-advancing tabbed showcase of 7 real app screens with crossfade + progress bars
- **Working 4-7-8 breathing demo** — the same exercise the app recommends for anxiety
- **Animated stat counters**, scroll reveals, hero parallax, floating glass cards, live ECG line, seamless marquee
- Fully responsive, and honors `prefers-reduced-motion`

Designed & engineered by Jasmine Liu.
