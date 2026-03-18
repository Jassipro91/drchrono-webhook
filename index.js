const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET = process.env.SECRET || "hubspot123";
const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK;

app.post('/webhook', async (req, res) => {
  try {
    const token =
      req.headers['x-drchrono-signature'] ||
      req.body.secret ||
      req.query.secret;

    if (token && token !== SECRET) {
      return res.status(403).send("Invalid token");
    }

    res.status(200).send("OK");

    await fetch(ZAPIER_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

  } catch (err) {
    console.error(err);
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
