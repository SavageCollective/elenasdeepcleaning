# Elena’s Deep Cleaning LLC - Branded Static Site (Local Test)

This is a **no-build**, mobile-first static site designed for fast call/text + quote form conversions.

## What’s included
- `index.html` - main landing page
- `thanks.html` - form confirmation page
- `styles.css` - branded styling (black + gold + blush/pink)
- `script.js` - minimal JS (menu, smooth scroll, local form preview redirect)
- `robots.txt`, `sitemap.xml`
- `assets/` - logo + icons extracted from the plan materials
  - `logo-full-small.webp/png` (hero)
  - `logo-mark.webp/png` (header/footer)
  - `favicon.png`, `apple-touch-icon.png`

## How to test locally
### Option A (recommended): Run a tiny local server
This site works best when served (so `/thanks.html` resolves correctly).

**Python**
```bash
cd elenas-site
python -m http.server 8080
```
Open: `http://localhost:8080`

**Node (if you prefer)**
```bash
cd elenas-site
npx serve .
```

> Netlify Forms won’t actually submit locally. The JavaScript detects localhost/file and simulates a successful redirect to `/thanks.html` so you can test the flow.

## Before going live
- Replace placeholder phone/email/domain if they’re not final
- Replace photo placeholders in the hero with real before/after + finished room photos
- Create a real `og-image.jpg` at the site root (or update the OG tag)

## Deploy (quick)
- **Netlify:** drag-and-drop the folder or connect a repo
- **Cloudflare Pages:** connect repo and deploy
