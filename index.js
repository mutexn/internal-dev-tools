const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const OUTPUT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

app.post('/screenshot', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  const filename = `capture_${Date.now()}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', 
	     '--disable-setuid-sandbox',
      	      "--disable-dev-shm-usage",
              "--disable-accelerated-2d-canvas",
              "--no-first-run",
              "--no-zygote",
              "--disable-gpu"
             ]
    });
    const page = await browser.newPage();
    await page.goto(url, { 
	    waitUntil: 'networkidle2', 
	    timeout: 300000
    });
    await page.screenshot({ path: outputPath, fullPage: true });
    await browser.close();

    res.json({
      message: 'Screenshot saved',
      filename,
      url: `/screenshots/${filename}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

// 画像の静的公開
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
