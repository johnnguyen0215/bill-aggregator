const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.CLIENT_ID);

async function verify(token, clientId) {
  await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
}

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

app.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  await verify(token, process.env.CLIENT_ID).catch((error) => {
    console.error(error);
    res.status(400).send({ message: 'The token is invalid' });
  });

  res.status(200).send({ message: 'Token validated' });
});

app.listen(port, () => {
  console.log(`Bill aggregator server listening on port ${port}`);
});
