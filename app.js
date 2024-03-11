const compression = require("compression");
const axios = require("axios");
const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 443;

const server = express();
server.disable('x-powered-by');
server.use(compression());

const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0',
    'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.48 Mobile Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15'
    // Add more user agents as needed
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

(async () => {
  server.get("/", async (req, res) => {
    try {
      const link = req.query.link ? req.query.link.trim() : null;
      let toSend;
      if (!link || link === "") {
        toSend = { error: true, message: "Link not provided. Use: /?link=yoursite.domain" };
      } else {
        const randomUserAgent = getRandomUserAgent();
        const resp = await axios.get(link, { headers: { 'User-Agent': randomUserAgent } });
        toSend = {
          error: false,
          message: `URL: ${resp.config.url}, Status: ${resp.status}, Status Text: ${resp.statusText}`
        };
      }
      console.log(toSend);
      res.json(toSend);
    } catch (e) {
      res.send({ error: true, message: e.message ? e.message : "" });
    }
  });
  
  server.get('/robots.txt', (req, res, next) => {
    res.type('text/plain')
    res.send("User-agent: *\nDisallow: /");
  });
  
  var errorHandler = require('express-error-handler'),
  handler = errorHandler({
    static: {
      '404': '404.html'
    }
  });
  server.use( errorHandler.httpError(404) );
  server.use( handler );

  server.listen(PORT, () => {
    console.log(`> Running on Port ${PORT}`);
  });
})();
