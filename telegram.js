const axios = require('axios');

function sendTelegram(message) {
  const botToken = '8432606138:AAEUbsJCy9XIZy6obTgyatnFgSIBV1UibAg'; // sənin bot tokenin
  const chatId = 786314379; // sənin chat ID
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  return axios.post(url, {
    chat_id: chatId,
    text: message
});
}

module.exports = sendTelegram;

