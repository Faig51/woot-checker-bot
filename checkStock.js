const axios = require('axios');
const fs = require('fs');
const sendTelegram = require('./telegram');

const notifiedFile = './notified.json';

// JSON fayldan əvvəldən göndərilmiş linkləri oxuyuruq
let notifiedLinks = [];
if (fs.existsSync(notifiedFile)) {
  notifiedLinks = JSON.parse(fs.readFileSync(notifiedFile));
}

const productList = [
  'https://sellout.woot.com/offers/caremax-cups-with-lids-25-4oz-specimen-jar',
  'https://home.woot.com/offers/honey-can-do-large-trunk-organizer-grey-6?ref=w_cnt_wp_0_2'
];

async function checkSoldOut(url) {
  try {
    const res = await axios.get(url);
    const html = res.data;

    if (html.includes('Sold Out')) {
      if (!notifiedLinks.includes(url)) {
        await sendTelegram(`🚫 SOLD OUT → ${url}`);
        console.log(`📢 İlk dəfə tapıldı: ${url}`);
        notifiedLinks.push(url);

        // Yeni göndərilən linkləri JSON fayla yazırıq
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

async function run() {
  for (const url of productList) {
    await checkSoldOut(url);
}
}

run();