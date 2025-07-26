const axios = require('axios');
const fs = require('fs');
const sendTelegram = require('./telegram');

const notifiedFile = './notified.json';
const productsFile = './products.json';

// Əvvəldən göndərilmiş linkləri oxuyuruq
let notifiedLinks = [];
if (fs.existsSync(notifiedFile)) {
  try {
    notifiedLinks = JSON.parse(fs.readFileSync(notifiedFile, 'utf-8'));
} catch (e) {
    console.error('❌ notified.json oxunmadı:', e.message);
}
}

// Məhsul siyahısını oxuyuruq
let productLinks = [];
if (fs.existsSync(productsFile)) {
  try {
    productLinks = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
} catch (e) {
    console.error('❌ products.json oxunmadı:', e.message);
}
} else {
  console.error('❌ products.json faylı tapılmadı!');
  process.exit(1);
}

// Sold Out yoxlaması
async function checkSoldOut(url) {
  try {
    const res = await axios.get(url);
    const html = res.data;

    if (html.includes('Sold Out')) {
      if (!notifiedLinks.includes(url)) {
        const message = `🚫 SOLD OUT\n${url}`;
        await sendTelegram(message);
        console.log(`📢 Yeni sold out tapıldı: ${url}`);
        notifiedLinks.push(url);

        fs.writeFileSync(notifiedFile, JSON.stringify(notifiedLinks, null, 2));
} else {
        console.log(`⏳ Artıq bildirilmiş → ${url}`);
}
} else {
      console.log(`✅ Hələ mövcuddur → ${url}`);
}
} catch (err) {
    console.error(`❌ Sorğuda xəta → ${url}`, err.message);
}
}

// Skripti işə salırıq
async function run() {
  console.log(`🚀 Yoxlama başlayır (${productLinks.length} məhsul)...`);
  for (const url of productLinks) {
    await checkSoldOut(url);
}
  console.log('✅ Yoxlama tamamlandı.');
}

run();


---

*💡 Əlavə fayl: products.json*

json
[
  "https://sellout.woot.com/offers/caremax-cups-with-lids-25-4oz-specimen-jar",
  "https://home.woot.com/offers/honey-can-do-large-trunk-organizer-grey-6?ref=w_cnt_wp_0_2"
]

