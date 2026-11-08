# Flower models

এই folder-এর HTML-গুলোই gift app-এর editable flower artwork। `Flowers.html` হলো Rose-এর
working demo; পাশাপাশি `Sunflower.html`, `Lily.html`, এবং `KathGolap.html`-ও app-এ যুক্ত।

## AI / Claude-এর জন্য project context

এই folder-এর model-গুলো শুধু আলাদা flower illustration নয়—এগুলো Virtual Gift app-এর shared
artwork library। Gift বানানোর সময় picker ও live preview-তে, আর gift খোলার পর recipient-এর
arrangement-এ একই model ব্যবহার হয়। লক্ষ্য হলো ব্যক্তিগত virtual gift-কে আরও উষ্ণ, polished,
আনন্দময় এবং মনে রাখার মতো করা। ফুলটি যেন ছোট icon-এর মতো না লাগে; arrangement-এ বসালেও যেন
পরিষ্কারভাবে চেনা যায় এবং ভালো দেখায়।

কোনো model edit বা নতুন model বানানোর আগে এই README এবং target HTML file পড়ুন। HTML-এ metadata
model-টিকে app-এর সঙ্গে যুক্ত করে; `<template id="flower-art">`-এর SVG-ই app render করে।
HTML-এর preview কেবল browser-এ model-টি আলাদাভাবে দেখার সুবিধা—app-এর gift renderer নয়।

### Artwork-এর লক্ষ্য

- বাস্তব ফুলের স্বতন্ত্র গঠন চিনতে পারা যায় এমনভাবে আঁকুন—যেমন petal-এর সংখ্যা/স্তর, center,
  silhouette, এবং ফুলভেদে আলাদা বৈশিষ্ট্য। শুধু গোলাপি/হলুদ generic bloom বানাবেন না।
- Clean, graceful, romantic digital illustration style রাখুন। নরম gradient, সূক্ষ্ম highlight,
  controlled shadow, এবং petal detail ব্যবহার করা যায়; কিন্তু অতিরিক্ত detail বা visual noise
  এড়িয়ে চলুন।
- ফুলটি ছোট card preview ও bouquet-তে একাধিকবার দেখা যায়—তাই silhouette এবং মূল রং ছোট আকারেও
  যেন আলাদা করে বোঝা যায়।
- `viewBox="0 0 100 100"`-এর মধ্যে flower head-টি মাঝখানে এবং যথেষ্ট বড় রাখুন। চারদিকে অল্প
  breathing room রাখুন, কিন্তু artwork এত ছোট করবেন না যেন bouquet-তে হারিয়ে যায়।
- SVG responsive ও vector-based রাখুন। External image, font, network asset, raster screenshot,
  build dependency, বা HTML page-embedding ব্যবহার করবেন না।

### AI change checklist

1. Existing flower edit করলে filename, `flower-id`, `flower-name`, `flower-emoji`,
   `flower-description`, এবং `flower-art` template ID অপরিবর্তিত রাখুন। এতে পুরোনো gift link
   ও saved gift-এর flower ID কাজ করতে থাকবে।
2. নতুন flower যোগ করলে নতুন ও unique `flower-id` দিন; কোনো বিদ্যমান ID পুনর্ব্যবহার বা rename
   করবেন না। App-এ type dynamicভাবে register হয়।
3. সম্পূর্ণ standalone HTML ফেরত দিন: metadata, inline SVG template, এবং চাইলে SVG template
   দেখানোর ছোট preview script। App model HTML-এর script চালায় না।
4. SVG-এর সব ID, gradient reference, ও filter reference সঠিক রাখুন। App একই bloom এক
   arrangement-এ বহুবার render করতে পারে; renderer প্রতিটি instance-এর ID আলাদা করে।
5. কোনো requirement অস্পষ্ট হলে metadata বা renderer contract বদলানোর বদলে আগে প্রশ্ন করুন।

## Model format

প্রতিটি flower একটি আলাদা `.html` file হবে। একই file-এ নিচের metadata এবং SVG রাখতে হবে:

```html
<meta name="flower-id" content="orchid">
<meta name="flower-name" content="Orchid">
<meta name="flower-emoji" content="🌺">
<meta name="flower-description" content="A graceful orchid in bloom.">

<template id="flower-art">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- Flower artwork centered in this viewBox -->
  </svg>
</template>
```

- `flower-id` অবশ্যই ছোট হাতের অক্ষর দিয়ে শুরু হবে; এরপর ছোট হাতের অক্ষর, সংখ্যা বা `-` ব্যবহার করুন। উদাহরণ: `orchid`, `bluebell-2`। `letter`, `constructor`, `prototype`, বা একই ID দ্বিতীয়বার ব্যবহার করবেন না।
- Metadata-র `name`, `emoji`, এবং `description` gift picker-এ দেখায়।
- Artwork-টি centered `0 0 100 100` SVG viewBox-এ রাখুন। SVG-এর gradient/filter ID রাখা যাবে; app প্রতিটি ফুলের instance-এর ID আলাদা করে দেয়।
- `flower-art` template-এর SVG-ই app ব্যবহার করে। HTML-এর বাকি অংশ standalone browser preview, styling, বা demo JavaScript-এর জন্য। App model HTML-এর JavaScript চালায় না; SVG থেকেও script, event handler, external link/image, এবং embedded CSS সরিয়ে দেয়।
- কেবল বিশ্বস্ত artwork যোগ করুন। App-এর নিরাপত্তার জন্য model-কে নিজের JS চালানোর অনুমতি দেওয়া হয় না।

## Claude-কে দেওয়ার prompt

Claude-কে এই README-সহ target HTML দিন। এরপর এই prompt ব্যবহার বা প্রয়োজনমতো বাড়িয়ে দিন:

```text
Read this folder's README.md first; it explains the Virtual Gift app, the
artwork's purpose, visual goals, and integration constraints. Then read the
provided flower HTML file.

Improve only the requested flower artwork while preserving its recognizable
species and the project's polished, romantic illustration style. If replacing
an existing model, keep its filename, all four flower metadata tags, their
values, and the <template id="flower-art"> contract unchanged. Return the
complete standalone HTML file. Keep the inline SVG centered and legible in
viewBox="0 0 100 100", responsive, self-contained, and scalable. Give all SVG
IDs and references valid names. Keep any preview script limited to displaying
the SVG template. Do not add dependencies, external assets, or app-specific
JavaScript. Before returning, check that the SVG is valid, metadata is intact,
and the template contains the finished flower.
```

## Replace বা নতুন flower যোগ করা

1. Existing flower বদলাতে Claude-এর generated HTML-টি একই filename দিয়ে এখানে replace করুন। ওই flower ID-র artwork auto-update হবে; gift card-এ আগের ID থাকায় saved gift/link-ও আগের মতো কাজ করবে।
2. নতুন flower যোগ করতে নতুন `.html` file দিন, metadata-তে নতুন unique ID দিন, এবং `flower-art` SVG template রাখুন। Local `python -m http.server` directory listing থেকে নতুন file auto-detect করে; browser reload করলেই নতুন flower picker, preview, এবং gift receiver-এ যোগ হবে।
3. Vercel deploy-এ `vercel.json` build-এর সময় catalog auto-generate করে, তাই নতুন HTML commit/push করলেই deploy-তে সেটি যোগ হয়। অন্য static host-এ deploy করার আগে root folder-এ `node tools/build-flower-catalog.js` চালান।

File replace করলে catalog entry manual edit করতে হয় না। Manifest শুধু static host-এ নতুন filename discover করার জন্য; artwork সবসময় ওই HTML file থেকেই load হয়।

## Optional metadata: `flower-kind`

Plants that stand on their own (for example potted cacti) should not be drawn on a flower stem. Add

```html
<meta name="flower-kind" content="cactus">
```

and the app renders the model as a free-standing plant (its own pot, no stem or leaf) and keeps it out of the wrapped
bouquet. Models whose `flower-id` starts with `cactus` are treated the same way. Without the tag, a model is a normal
flower. `flower-accent` (optional, a hex colour) sets the colour of the petals that fly off when the flower is tapped.
Because the app draws every model once as a shared SVG `<symbol>`, keep gradient/filter IDs unique within a file.
