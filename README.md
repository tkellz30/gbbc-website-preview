# Grace Bible Baptist Church — Static Website

Multi-page static site ready for **GitHub Pages** deployment.

## Folder Structure

```
/
├── index.html              ← Home (hero slideshow lives here only)
├── about.html
├── plan-a-visit.html
├── give.html
├── events.html
├── building-project.html
├── contact.html
├── css/
│   └── styles.css          ← All CSS (design tokens, components, layout)
├── js/
│   └── main.js             ← Hero slideshow + getDirections + accordion + mobile menu
└── assets/
    ├── logo.png            ← Upload your church logo here (PNG, @2x recommended)
    └── fairfielddr.jpeg    ← Upload the Fairfield Dr site photo here
```

## Before Going Live — Checklist

- [ ] Add `assets/logo.png` — your church logo (transparent PNG, ~320px wide @2x)
- [ ] Add `assets/fairfielddr.jpeg` — building site photo for building-project.html
- [ ] Replace hero slideshow `background-image` URLs in `css/styles.css` with real photos
      (lines under `.hero-slide:nth-child(1–5)`)
- [ ] Update Facebook Messenger URL in `contact.html`:
      Change `https://www.facebook.com/share/...` to `https://m.me/YOUR_PAGE_ID`
- [ ] Swap placeholder events in `events.html` with real event data
- [ ] Wire up the contact form in `contact.html` to a form service
      (Formspree, Netlify Forms, or Contact Form 7 if moving to WordPress)

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `gbbc-website`)
2. Push all files to the `main` branch
3. Go to Settings → Pages → Source: `Deploy from a branch` → `main` → `/ (root)`
4. Your site will be live at `https://yourusername.github.io/gbbc-website/`

### Custom Domain (gbbcpensacola.org)

1. Add a `CNAME` file to the repo root containing: `gbbcpensacola.org`
2. Point your domain's DNS A records to GitHub Pages IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
3. Add CNAME record: `www` → `yourusername.github.io`
4. Enable HTTPS in GitHub Pages settings (takes ~15 min after DNS propagates)

## Key Design Tokens (css/styles.css)

| Token                | Value     | Use                        |
|----------------------|-----------|----------------------------|
| `--color-maroon`     | `#7D2027` | Primary brand color        |
| `--color-gold`       | `#C9A55A` | Accent / eyebrow labels    |
| `--color-navy`       | `#1D3557` | Secondary / Watch Live bg  |
| `--color-bg`         | `#F0E9DF` | Warm cream page background |
| `--font-display`     | Cormorant Garamond | Headings         |
| `--font-body`        | Source Sans 3      | Body / UI        |

## External Links Used

| Purpose              | URL                                                              |
|----------------------|------------------------------------------------------------------|
| Facebook / Watch Live | https://www.facebook.com/share/1EXpFRQ71C/?mibextid=wwXIfr    |
| Connection Card      | https://gbbcpensacola.churchtrac.com/card/4                     |
| Online Giving        | https://gbbcpensacola.churchtrac.com/give                       |
| Events Calendar      | https://gbbcpensacola.churchtrac.com/upcoming_events            |
| Member Login         | https://gbbcpensacola.churchtrac.com                            |

## Service Times (do not change without updating all pages)

| Service                | Day       | Time     |
|------------------------|-----------|----------|
| Adult Sunday School    | Sunday    | 9:45 AM  |
| Children's Sunday School | Sunday  | 9:45 AM  |
| Morning Worship Service | Sunday   | 10:45 AM |
| Prayer Service         | Wednesday | 6:45 PM  |

## Addresses

- **Current:** 7201 Klondike Rd, Pensacola, FL 32526 (white building in the back)
- **New building:** 4805 W Fairfield Dr, Pensacola, FL
