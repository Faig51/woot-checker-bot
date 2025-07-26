const axios = require('axios');
const fs = require('fs');
const sendTelegram = require('./telegram');

const notifiedFile = './notified.json';
const productsTxtFile = './products.txt';

// Göndərilmiş linkləri oxuyuruq
let notifiedLinks = [];
if (fs.existsSync(notifiedFile)) {
  try {
    notifiedLinks = JSON.parse(fs.readFileSync(notifiedFile, 'utf-8'));
} catch (e) {
    console.error('❌ notified.json oxunmadı:', e.message);
}
}

// Məhsul siyahısını.txt faylından oxuyuruq
let productLinks = [];
if (fs.existsSync(productsTxtFile)) {
  try {
    const txtData = fs.readFileSync(productsTxtFile, 'utf-8');
    productLinks = txtData
.split('\n')
.map(line => line.trim())
.filter(line => line.length> 0);
} catch (e) {
    console.error('❌ products.txt oxunmadı:', e.message);
}
} else {
  console.error('❌ products.txt faylı tapılmadı!');
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

        try {
          fs.writeFileSync(notifiedFile, JSON.stringify(notifiedLinks, null, 2));
          console.log(`🗂 notified.json yeniləndi → ${url}`);
} catch (e) {
          console.error(`❌ notified.json yazılmadı: ${e.message}`);
}
} else {
        console.log(`⏳ Artıq bildirilmiş → ${url}`);
}
} else {
      console.log(`✅ Hələ mövcuddur → ${url}`);
}
} catch (err) {
    console.error(`❌ Sorğuda xəta → ${url}: ${err.message}`);
}
}

// Botu işə salırıq
async function run() {
  console.log(`🚀 ${productLinks.length} məhsul yoxlanır...`);
  for (const url of productLinks) {
    await checkSoldOut(url);
}
  console.log('✅ Yoxlama tamamlandı.');
}

run();
