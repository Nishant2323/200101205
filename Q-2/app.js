const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const REQUESTTIMEOUT = 500; // milliseconds

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URL parameters. please check ' });
  }

  const validURLs = urls.filter(url => isValid(url));

  if (validURLs.length === 0) {
    return res.status(400).json({ error: 'No valid URLs found ' });
  }

  try {
    const nuPromises = validURLs.map(url => axios.get(url, { timeout: REQUESTTIMEOUT }));
    const responses = await Promise.allSettled(nuPromises);

    const num = responses
      .filter(response => response.status === 'fulfilled' && Array.isArray(response.value.data?.numbers))
      .flatMap(response => response.value.data.numbers);

    const uni = Array.from(new Set(num)).sort((a, b) => a - b);

    res.json({ num: uni });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving numbers from the provided URLs.' });
  }
});

function isValid(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

app.listen(PORT, () => {
  console.log(`service is running on ${PORT}`);
});