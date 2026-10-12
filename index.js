const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;
const TARGET_URL = 'https://hardverapro.hu/aprok/hardver/videokartya/nvidia/geforce_30xx/index.html';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const DISABLE_CACHE = false; // Set to true to bypass caching

async function scrapeProducts() {
    console.log('Scraping target website...');
    try {
        const { data } = await axios.get(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Cookie': 'sid=92d54944e48e11ca04ba52a3c4b0a73ebb7671d4b9c7da12cd5506212fd005db; vid=60a7a2afbe34cccc8a3ed7433928fd3af106041a2e03cb1a3cc37f2ad5a2f480; usprivacy=1---; euconsent-v2=CQr-V4AQr-V4AAKA9AHUC0FsAP_gAEPgAA6gM8tR_G__bWlr-bb3abtkeYxP9_hr7sQxBgbIkm4FzLvW7JwGx2EaJAyatiIKmRIAu3DBIQNlHBDURUCgKIAFryDMaE2U4TNKJ6BkiFMZIytQCExvm4tjeQCZ4ur_9kc0mB-s6dr-2dzyy6hHn3K5fmS1UJSdIYesDfv-ZhOS-9IE9-x8v4v4_EbpEm0eSVn9pEsp4zc6Yns6dBmxt-Tyff6Pn_f71fS7X_ve_n3zv8oXn7rr6-__f3-7v__-bf-___b-__7Z_zM_37_v_ftb-_4M8AAmGh0QBlkQKBAoCEECABQVhABQIAgAASAogIATBgQ5AwAXWESAEAKAAIIAQAAgwABAAAJAAhEAEABAIAQIBAoAAwAIAgIAGBgADABQiAQAAgOgYpAQQCBYAJEYUBggQgAIBAS2VCCUDAgjhCkWOAQQIiYKAABEAAqAgEA8LAQklRKxIIAuILoAEAAABKMEUAFICYAooDIFoKwJOAyNMAQfMEiSHQRAEwQkZBkQkqCQeKYogQQ5AbFLMAdPEFADLtZIQ_1As2ALkS7DqSsJAwAA.IAAA.YAAAAAAAAAAA; IABGPP_HDR_GppString=DBABMA~CQr-V4AQr-V4AAKA9AHUC0FsAP_gAEPgAA6gM8tR_G__bWlr-bb3abtkeYxP9_hr7sQxBgbIkm4FzLvW7JwGx2EaJAyatiIKmRIAu3DBIQNlHBDURUCgKIAFryDMaE2U4TNKJ6BkiFMZIytQCExvm4tjeQCZ4ur_9kc0mB-s6dr-2dzyy6hHn3K5fmS1UJSdIYesDfv-ZhOS-9IE9-x8v4v4_EbpEm0eSVn9pEsp4zc6Yns6dBmxt-Tyff6Pn_f71fS7X_ve_n3zv8oXn7rr6-__f3-7v__-bf-___b-__7Z_zM_37_v_ftb-_4M8AAmGh0QBlkQKBAoCEECABQVhABQIAgAASAogIATBgQ5AwAXWESAEAKAAIIAQAAgwABAAAJAAhEAEABAIAQIBAoAAwAIAgIAGBgADABQiAQAAgOgYpAQQCBYAJEYUBggQgAIBAS2VCCUDAgjhCkWOAQQIiYKAABEAAqAgEA8LAQklRKxIIAuILoAEAAABKMEUAFICYAooDIFoKwJOAyNMAQfMEiSHQRAEwQkZBkQkqCQeKYogQQ5AbFLMAdPEFADLtZIQ_1As2ALkS7DqSsJAwAA.IAAA.YAAAAAAAAAAA; _pubcid=9ab0c7b6-ac47-4509-b5c0-0d4cc730123f; _ga=GA1.1.1322316.1791810863; __gads=ID=8c405793398a8411:T=1791810862:RT=1791810862:S=ALNI_Mazp632EBdmc04FrSDr0Cn5flEk6A; __gpi=UID=0000159ab3d9690e:T=1791810862:RT=1791810862:S=ALNI_MZFW7oB-_nFzgv7Zrxc03vsL8-Vgw; __eoi=ID=54b2ca6bcca5c912:T=1791810862:RT=1791810862:S=AA-AfjaNaQX8JXXFykS635PgngMe; __gfp_64b=eTrMITBS17nibikb.5hYIFMza5ycklED395O6mrWpEb.77|1791810863|2|||8:3:32; _cc_id=93bb7718bf04c473f674c7d7cf7859b; panoramaId_expiry=1792415665811; panoramaId=608f4e4aeba7cff579be139502ac185ca02c70f660f18b90d3e4f5648bd3d554; panoramaIdType=panoDevice; _ga_T8S5KHM1SF=GS2.1.s1791810863$o1$g1$t1791810879$j44$l0$h0; nvq_hid=fe6343ed-bf53-4031-9c5a-42a7cf3c6266'
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
        if (error.response) {
            console.error('Scraping failed - Response Error:');
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('Scraping failed - No Response:');
            console.error(error.request);
        } else {
            console.error('Scraping failed - Error:', error.message);
        }
        throw error;
    }
}
let cachedProducts = null;
let lastFetchTime = 0;

async function getProducts() {
    const now = Date.now();
    if (!DISABLE_CACHE && cachedProducts && (now - lastFetchTime < CACHE_DURATION_MS)) {
        console.log('Returning cached products...');
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
            Filter: <input type="text" id="filterText" value="12GB">
        </label>
        <label style="margin-left: 20px;">
            <input type="checkbox" id="icedCheckbox"> Iced
        </label>
    </div>
    <div id="list" class="product-list"></div>

    <script>
        const products = ${JSON.stringify(products)};
        const listEl = document.getElementById('list');
        const filterText = document.getElementById('filterText');
        const icedCheckbox = document.getElementById('icedCheckbox');

        function render() {
            const text = filterText.value.toLowerCase();
            const isIcedRequested = icedCheckbox.checked;

            listEl.innerHTML = '';
            const filtered = products.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(text);
                const icedMatch = (p.isIced === isIcedRequested);
                return nameMatch && icedMatch;
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

        filterText.addEventListener('input', render);
        icedCheckbox.addEventListener('change', render);
        render();
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
