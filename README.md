# VidCard Watcher

A lightweight monitoring tool that scrapes and filters used NVIDIA GeForce 30xx video card listings from [HardveraPro](https://hardverapro.hu).

## Features
- **Live Scraping**: Fetches current listings directly from the target website.
- **Client-Side Filtering**: Quickly filter results by keywords (e.g., "12GB") and "Iced" status without reloading the page.
- **Caching**: Implements a basic cache to reduce request frequency to the target server.

## Tech Stack
- **Backend**: Node.js, Express
- **Scraping**: Axios, Cheerio

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the server**:
   ```bash
   node index.js
   ```

3. **Access the dashboard**:
   Open your browser and navigate to `http://localhost:3000`.
