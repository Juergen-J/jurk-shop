# TODO

## Catalog
- [ ] Regenerate the remaining product photos in 3:2 (`OPENAI_IMAGE_SIZE`
      default is now 1536x1024). Only these six are 3:2 so far: 2270055,
      2429964, 2027911, 3308695, 2843854, 1986888. The square ones may show
      boxes too narrow or too low. About 103 images, ~35 min, ~$15:
      `node tools/catalog/images.mjs generate --force`, then `review`, then
      `upload`.
- [ ] Prices: 83 options (mostly Mini, Tasche, Kompakt) still use estimated
      weight and print time from MakerWorld (`schaetzung=ja`). Slice them in
      Bambu Studio and enter `gewicht_g` / `druckzeit_h`, then clear
      `schaetzung`. Notion models are exact, 41 options use the eBay price
      without eBay fees (`preis_eur`).
- [ ] Shotgun boxes by shell length (12/70, 12/76, 12/89 …): weight and print
      time of the taller boxes are copied from 12/70, enter the real ones.
- [ ] Later: universal wide box with custom inserts (e.g. .45 ACP 100 rounds,
      Notion ".45 100R").
- [ ] eBay: check the "100 Rounds" variants for .270, .30-30, .350 Legend,
      6mm ARC, 22-250 (probably listed by mistake).
- [ ] Update `rang` from time to time (eBay active listings report, "Sold
      quantity").
- [ ] Photos for products without one: .223 Rem, 7.62x51, Kaliber 16/20,
      6mm Creedmoor, .22 Creedmoor, .45 ACP USA Edition.

## Go-live
- [ ] Production catalog: create a Secret API Key in the admin, then run
      `import.mjs` and `images.mjs upload` against https://api.jurk.pro (see
      DEPLOY.md).
- [ ] Storefront domain shop.jurk.pro (Railway custom domain + Cloudflare
      CNAME/TXT, CORS variables on the backend).
- [ ] SMTP for order emails via Resend (send.jurk.pro is verified there).
- [ ] Datenschutz: name the providers (Railway, Cloudflare R2, Resend).
- [ ] Test order on production: order, emails, bank details.
