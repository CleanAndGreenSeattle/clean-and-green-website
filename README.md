# Clean & Green website: developer handoff

Plain HTML, CSS and JavaScript. No build step, no frameworks. Upload the folder contents to any static host.

## Files
- `index.html` Home (light retro style, animated truck, services carousel, Elfsight reviews)
- `pricing.html` Pricing and estimate calculator (dark style)
- `meet-your-technician.html` Our Story (dark style)
- `css/styles.css` one shared stylesheet (`body.theme-home` vs `body.theme-dark`)
- `js/main.js` carousel, decorative trees, footer year
- `js/pricing.js` calculator. **All prices are in the CATALOG block at the top.**
- `assets/` photos

Fonts load from Google Fonts (Anton, Russo One, Kaushan Script, DM Sans).

## Business rules built in
- Taxes and fees are included in all pricing.
- $200 carpet minimum (adds a "minimum adjustment" line).
- Air duct: Small up to 1,500 sq ft $449, Medium 1,501-2,500 $549, Large 2,501-3,500 $699, over 3,500 custom in-home quote.
- Dryer vent: $179 alone, $129 with air duct cleaning.
- Only ONE bundle applies at a time, whichever saves more: 15% off carpet + duct, or $50 off dryer vent.

## Please confirm before launch
1. (Confirmed by owner) Phone number `425.280.0022` (appears in header, CTA and footers; `tel:4252800022`). It was read from the truck decal.
2. Jobber booking link is correct (search for `clienthub.getjobber.com`).
3. (Confirmed by owner) The 15% bundle is calculated on carpet (including the $200 minimum if it applies) plus the duct price. Adjust in `pricing.js` if it should apply differently.
4. Elfsight Google Reviews snippet is in `index.html` (`#reviews`). It only renders on the live domain.
5. Add real meta/OG images and favicon as desired.

## Notes
- Animations respect `prefers-reduced-motion`; the carousel starts paused for those users.
- The truck scene and clouds are decorative (`aria-hidden`).
