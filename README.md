# Shafin's Virtual Gift

Run locally (QR/Web Share need HTTP, not `file://`): `python -m http.server 8000`, then open
http://localhost:8000. The site is static and can be deployed directly to Vercel; no build command or
serverless function is required.



Gift links and QR codes carry a validated, URL-safe copy of the gift, so they work on another device
without relying on the creator's browser storage. Gifts expire 24 hours after creation. Anyone with
the link can view the gift, and deleting the creator's local copy does not revoke a link that was
already shared. Letter gifts carry their own text and do not include a separate personal note. Keep
private information out of gift notes or letters.

The dashboard's gift history and demo login are stored in the browser's LocalStorage. Older `?id=...`
links still work in the browser where their gift was created; newly generated links are portable.
