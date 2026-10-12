const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 8080;
const TARGET_URL = 'https://hardverapro.hu/aprok/hardver/videokartya/nvidia/geforce_30xx/index.html';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
async function scrapeProducts() {
    console.log('Scraping target website...');
    try {
        const { data } = await axios.get(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Cookie': 'sid=68735af0e31389c2dbc8a0f01b83bfbd1d43ad148549bc46dd2833665fdfe541; vid=f92b7eedbb96b0d3144b27732899067dd0759c985304658877a6172aa703edde; usprivacy=1---; euconsent-v2=CQr-V4AQr-V4AAKA9AHUC0FgAAAAAEPgAA6gAAAZ4ABMNDogDLIgUCBQEIIEACgrCACgQBAAAkBRAQAmDAhyBgAusIkAIAUAAQQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGAChEAgABAdAxSAggECwASIwoDBAhAAQCAlsqEEoGBBHCFIscAggREwUAACIABUBAIB4WAhJKiViQQBcQXQAIAAACUYIoAKQEwBRQGQLQVgScBkaYAg-YJEkOgiAJghIyDIhJUEg8UxRAghyA2KWYA6eIKAGXayQh_qBZsAXIl2HUlYSBgAA.IAAA.YAAAAAAAAAAA; IABGPP_HDR_GppString=DBABMA~CQr-V4AQr-V4AAKA9AHUC0FgAAAAAEPgAA6gAAAZ4ABMNDogDLIgUCBQEIIEACgrCACgQBAAAkBRAQAmDAhyBgAusIkAIAUAAQQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGAChEAgABAdAxSAggECwASIwoDBAhAAQCAlsqEEoGBBHCFIscAggREwUAACIABUBAIB4WAhJKiViQQBcQXQAIAAACUYIoAKQEwBRQGQLQVgScBkaYAg-YJEkOgiAJghIyDIhJUEg8UxRAghyA2KWYA6eIKAGXayQh_qBZsAXIl2HUlYSBgAA.IAAA.YAAAAAAAAAAA; _pubcid=e95f5130-eb01-4e68-9d34-de2e83aca946; nvq_hid=38f4f0d1-a4e8-48a8-bd9d-4728ef70d324'
            }
        });
        const $ = cheerio.load(data);
        const products = [];

        $('.media').each((_, el) => {
            const $el = $(el);

            const titleElement = $el.find('.uad-col-title h1 a');
            const name = titleElement.text().trim();
            const link = titleElement.attr('href');

            const time = $el.find('.uad-time time').first().text().trim() || $el.find('.uad-time').first().text().trim();

            const priceElement = $el.find('.uad-price');
            const price = priceElement.find('.text-nowrap').first().text().trim();

            // Check if any element inside .media has the .uad-price-iced class
            const isIced = $el.find('.uad-price-iced').length > 0;

            if (name) {
                products.push({
                    name,
                    link: link ? (link.startsWith('http') ? link : `https://hardverapro.hu${link}`) : '',
                    time,
                    price,
                    isIced
                });
            }
        });

        return products;
    } catch (error) {
        console.error('Scraping failed:', error.message);
        throw error;
    }
}
let cachedProducts = null;
let lastFetchTime = 0;

async function getProducts() {
    const now = Date.now();
    if (cachedProducts && (now - lastFetchTime < CACHE_DURATION_MS)) {
        console.log('Using in-memory cached data...');
        return cachedProducts;
    }

    const products = await scrapeProducts();
    cachedProducts = products;
    lastFetchTime = now;
    return products;
}

app.get('/', async (req, res) => {
    try {
        const products = await getProducts();

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VidCard Watcher</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; background: #f4f4f9; }
        .controls { margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .product-list { display: grid; gap: 15px; }
        .product-card { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 5px solid #ccc; }
        .product-card.iced { border-left-color: #a0c4ff; background: #f0f7ff; }
        .product-card h3 { margin: 0 0 10px 0; }
        .product-card a { color: #0066cc; text-decoration: none; }
        .product-card a:hover { text-decoration: underline; }
        .meta { font-size: 0.9em; color: #666; }
        .price { font-weight: bold; color: #333; }
        .badge { font-size: 0.8em; padding: 2px 6px; border-radius: 4px; background: #eee; margin-left: 10px; }
        .badge-iced { background: #a0c4ff; color: #004085; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <h1>Video Cards Watcher</h1>
    <div class="controls">
        <label>
            <input type="checkbox" id="showAllToggle"> Show All (Hide 12GB Non-Iced Filter)
        </label>
        <p><small>Initial filter: Name contains "12GB" AND is NOT iced.</small></p>
    </div>
    <div id="list" class="product-list"></div>

    <script>
        const products = ${JSON.stringify(products)};
        const listEl = document.getElementById('list');
        const toggle = document.getElementById('showAllToggle');

        function render(showAll) {
            listEl.innerHTML = '';
            const filtered = products.filter(p => {
                if (showAll) return true;
                const nameMatch = p.name.toLowerCase().includes('12gb');
                return nameMatch && !p.isIced;
            });

            if (filtered.length === 0) {
                listEl.innerHTML = '<p>No products found matching the criteria.</p>';
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card' + (p.isIced ? ' iced' : '');
                card.innerHTML = 
                    '<h3 style="margin:0"><a href="' + p.link + '" target="_blank">' + p.name + '</a></h3>' +
                    '<div class="meta">' +
                    '<span>Published: ' + p.time + '</span> | ' +
                    '<span class="price">' + p.price + '</span>' +
                    (p.isIced ? '<span class="badge badge-iced">ICED</span>' : '<span class="badge">Available</span>') +
                    '</div>';
                listEl.appendChild(card);
            });
        }

        toggle.addEventListener('change', (e) => render(e.target.checked));
        render(false);
    </script>
</body>
</html>
        `;
        res.send(html);
    } catch (error) {
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use. Please kill the process or use a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});
