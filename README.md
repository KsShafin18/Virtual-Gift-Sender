# Shafin's Virtual Gift

Run locally (QR/Web Share need HTTP, not `file://`): `python -m http.server 8000`, then open
http://localhost:8000. The site is static; Vercel's build command only generates the flower catalog,
and no serverless function is required.

## Flower artwork models

Replaceable flower models live in [models/flowers_Model/](./models/flowers_Model/). See its
[README](./models/flowers_Model/README.md) for the HTML/SVG format, a Claude prompt, and the
replace-or-add workflow. Existing model files can be replaced in place; new `.html` models are
discovered automatically by the local HTTP server. Vercel regenerates the model catalog during
deployment. For another static host, run `node tools/build-flower-catalog.js` before deployment.



Gift links and QR codes carry a validated, URL-safe copy of the gift, so they work on another device
without relying on the creator's browser storage. Gifts expire 24 hours after creation. Anyone with
the link can view the gift, and deleting the creator's local copy does not revoke a link that was
already shared. Letter gifts carry their own text and do not include a separate personal note. Keep
private information out of gift notes or letters.

The dashboard's gift history and demo login are stored in the browser's LocalStorage. Older `?id=...`
links still work in the browser where their gift was created; newly generated links are portable.

## Special gifts, colour variants and caching

- `specials.js` holds the Magic Moon, Dancing Couple Snow Globe and Kidney Gift (inline SVG + CSS motion). Their receiver options
  (`extra` in the saved receiver state) are validated in `storage.js`.
- `flowers.js` derives colour variants at load time (`VARIANTS`): rose colours and the carved-wood roses (Natural, Red, Pink,
  Yellow, White, Black). Each variant is a normal hidden type such as `rose-yellow` or `wood-rose-pink`.
- Script/CSS tags carry `?v=4` and `vercel.json` sends `Cache-Control: no-cache`, so a redeploy never mixes old and new files.
  Bump the number when you change a script.
