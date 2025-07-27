const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const pin = req.query.pin;

  if (!pin) {
    return res.status(400).send('PIN code is required.');
  }

  const url = `https://www.amazon.in/s?k=${encodeURIComponent(pin)}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const html = await page.content();

    await browser.close();

    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error occurred while processing.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
