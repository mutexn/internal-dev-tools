const express = require('express');
const puppeteer = require('puppeteer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// 画像保存先
const OUTPUT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Webページのキャプチャ取得API
app.post('/screenshot', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'Missing URL' });

  const filename = `capture_${Date.now()}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: outputPath, fullPage: true });
    await browser.close();

    return res.status(200).json({
      message: 'Screenshot saved',
      filename,
      path: `/screenshots/${filename}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

// 静的ファイル配信用（スクリーンショット表示）
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
