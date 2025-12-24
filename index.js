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
	     <link rel="icon" href="https://assets-in.bmscdn.com/m6/images/icons/new-logo-152.png" type="image/x-icon">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bookmyshow Rating & Interest Count Fetcher</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Poppins    :wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          text-align: center;
          flex-direction: column;
          color: #fff;
          padding: 20px;
        }
        
        .container {
          max-width: 500px;
          width: 100%;
        }
        
        .header {
          margin-bottom: 30px;
          animation: fadeInDown 1s ease-out;
        }
        
        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
        }
        
        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
          font-weight: 300;
        }
        
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          animation: fadeInUp 1s ease-out 0.3s both;
        }
        
        .input-group {
          position: relative;
          margin-bottom: 25px;
          width: 100%;
        }
        
        .input-group i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #667eea;
          z-index: 2;
        }
        
        input[type="text"], select {
          padding: 15px 15px 15px 45px;
          width: 100%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
        }
        
        input[type="text"]:focus, select:focus {
          outline: none;
          border-color: #ff6b6b;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
          transform: translateY(-2px);
        }
        
        input[type="text"]::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        select {
          cursor: pointer;
          padding-left: 45px;
        }
        
        select option {
          background: #667eea;
          color: #fff;
        }
        
        button {
          padding: 15px 40px;
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          color: #fff;
          border: none;
          border-radius: 15px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(255, 107, 107, 0.4);
        }
        
        button:hover::before {
          left: 100%;
        }
        
        button:active {
          transform: translateY(-1px);
        }
        
        .result-box {
          margin-top: 25px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          color: #fff;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideIn 0.5s ease-out;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .result-box strong {
          color: #feca57;
          font-size: 1.1rem;
        }
        
        .footer {
          margin-top: 25px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 300;
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
          }
          
          form {
            padding: 30px 20px;
          }
          
          input[type="text"], select {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><i class="fas fa-film"></i> BookMyShow</h1>
          <p>Movies Rating & Interest Count Tool</p>
        </div>
        
        <form action="/search" method="get">
          <div class="input-group">
            <i class="fas fa-search"></i>
            <input type="text" id="query" name="query" value="${movieQuery}" placeholder="Enter Movie Name">
          </div>
          
          <div class="input-group">
            <i class="fas fa-filter"></i>
            <select name="type" id="typeSelect" onchange="clearQueryAndResult()">
              <option value="rating" ${selectedType === 'rating' ? 'selected' : ''}>⭐ Rating</option>
              <option value="interest" ${selectedType === 'interest' ? 'selected' : ''}>❤️ Interest Count</option>
            </select>
          </div>
          
          <button type="submit">
            <i class="fas fa-search"></i> Search Movie
          </button>
          
          ${searchResult ? `
            <div class="result-box">
              <i class="fas fa-${selectedType === 'rating' ? 'star' : 'heart'}"></i>
              <strong>${selectedType === 'rating' ? 'Rating' : 'Interest Count'}:</strong> ${searchResult}
            </div>
          ` : ''}
          
          <div class="footer">
            <i class="fas fa-code"></i> Designed & Developed By Yashwanth R
          </div>
        </form>
      </div>
      
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

await page.goto(`https://www.google.com/search?q=${searchQuery}`, { waitUntil: 'domcontentloaded', timeout: 10000 });

  const firstLinkSelector = 'h3';
  await page.waitForSelector(firstLinkSelector);
  const firstLink = await page.$(firstLinkSelector);
  const link = await firstLink.evaluate(el => el.closest('a').href);
  await page.goto(link);

  let result;

if (type === 'rating') {
  try {
    result = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const ratingSpan = spans.find(s => /^\s*\d+(\.\d+)?\/10\s*$/.test(s.textContent));
      const votesSpan = spans.find(s => /^\s*\(.*\s+Votes\)\s*$/.test(s.textContent));
      if (ratingSpan) {
        const rating = ratingSpan.textContent.trim();
        const votes = votesSpan ? votesSpan.textContent.trim() : '';
        return `${rating} ${votes}`.trim();
      }
      return 'Rating not found';
    });
  } catch (e) {
    result = 'Rating not found';
  }
} else if (type === 'interest') {
  try {
    result = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const match = spans.find(s => /interested/i.test(s.textContent));
      return match ? match.textContent.trim() : 'Interest count not found';
    });
  } catch (e) {
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



