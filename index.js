const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  const searchResult = req.query.result || '';
  const movieQuery = req.query.query || '';
  const selectedType = req.query.type || 'rating';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
	     <link rel="icon" href="https://favicon-generator.org/favicon-generator/htdocs/favicons/2015-02-02/042180ff74ed65b9baae3da9a0c8f809.ico" type="image/x-icon">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bookmyshow Rating & Interest Count Fetcher</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-image: url('https://wallpaperaccess.com/full/1567770.gif');
          background-size: cover;
          background-position: center;
          text-align: center;
          flex-direction: column;
          color: #130303;
        }
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px;
          background-color: rgba(0, 0, 0, 0.6);
          border-radius: 10px;
        }
        h1 {
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 2px 2px 5px #000;
        }
        input[type="text"], select {
          padding: 10px;
          margin-bottom: 20px;
          width: 300px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
        }
        select {
          appearance: none;
          background: url('https://cdn-icons-png.flaticon.com/512/271/271210.png') no-repeat right 10px center;
          background-size: 15px;
          background-color: #fff;
          color: #000;
        }
        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        .result-box {
          margin-top: 20px;
          padding: 10px;
          background-color: #fff;
          color: #000;
          border-radius: 5px;
        }
        .footer {
          margin-top: 15px;
          font-size: 14px;
          color: #71ff7a;
        }
      </style>
    </head>
    <body>
      <h4>BookMyShow Movies Rating & Interest Count Tool</h4>
	  <br>
      <form action="/search" method="get">
        <input type="text" id="query" name="query" value="${movieQuery}" placeholder="Enter Movie Name" class="form-control">
        <select name="type" class="form-control" id="typeSelect" onchange="clearQueryAndResult()">
          <option value="rating" ${selectedType === 'rating' ? 'selected' : ''}>Rating</option>
          <option value="interest" ${selectedType === 'interest' ? 'selected' : ''}>Interest Count</option>
        </select>
        <button type="submit" class="btn btn-primary">Search</button>
        ${searchResult ? `
          <div class="result-box">
            <strong>${selectedType === 'rating' ? 'Rating' : 'Interest Count'}:</strong> ${searchResult}
          </div>
        ` : ''}
        <div class="footer">Designed & Developed By Yashwanth R</div>
      </form>
      <script>
        function clearQueryAndResult() {
          window.location.href = '/?type=' + document.getElementById('typeSelect').value;
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/search', async (req, res) => {
  const query = req.query.query;
  const type = req.query.type || 'rating';
  if (!query) return res.redirect('/');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const blockTypes = ['image', 'stylesheet', 'font', 'media'];
    if (blockTypes.includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36');
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  const searchQuery = encodeURIComponent(query + " bookmyshow site:bookmyshow.com");

  await page.goto(`https://www.google.com/search?q=${searchQuery}`, { waitUntil: 'domcontentloaded' });

  const firstLinkSelector = 'h3';
  await page.waitForSelector(firstLinkSelector);
  const firstLink = await page.$(firstLinkSelector);
  const link = await firstLink.evaluate(el => el.closest('a').href);
  await page.goto(link);

  let result;

  if (type === 'rating') {
    try {
      await page.waitForSelector('.sc-ycjzp1-4.jeTxcB', { timeout: 5000 });
      result = await page.$eval('.sc-ycjzp1-4.jeTxcB', el => el.innerText);
    } catch (error) {
      result = 'Rating not found';
    }
  } else if (type === 'interest') {
    try {
      await page.waitForSelector('.sc-15uprjp-1.lfDvlb', { timeout: 5000 });
      result = await page.$eval('.sc-15uprjp-1.lfDvlb', el => el.innerText);
    } catch (error) {
      result = 'Interest count not found';
    }
  }

  console.log(`${type === 'rating' ? 'Rating' : 'Interest Count'}:`, result);

  await browser.close();

  res.redirect(`/?query=${encodeURIComponent(query)}&result=${encodeURIComponent(result)}&type=${encodeURIComponent(type)}`);
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
