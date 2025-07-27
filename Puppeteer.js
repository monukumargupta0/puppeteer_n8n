const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/', async (req, res) => {
  const { pincode } = req.body;

  if (!pincode) {
    return res.status(400).json({ error: 'Pincode is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto('https://www.amazon.in/s?k=neuherbs', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.click('#nav-global-location-popover-link');
    await page.waitForSelector('#GLUXZipUpdateInput');
    await page.evaluate(() => (document.querySelector('#GLUXZipUpdateInput').value = ''));
    await page.type('#GLUXZipUpdateInput', pincode);
    await page.click('#GLUXZipUpdate');

    const continueButton = await page.$('input[name="glowDoneButton"]');
    if (continueButton) {
      await continueButton.click();
    }

    await page.waitForTimeout(5000); // Let page load

    const html = await page.content();

    await browser.close();

    return res.json({ pincode, html });
  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
