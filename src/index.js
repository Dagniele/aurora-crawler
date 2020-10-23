const express = require('express');
const CronJob = require('cron').CronJob;
const crawl = require('./crawl');
const { sendMail, verify } = require('./mailer');
const parse = require('./parse');

const app = express();
const port = process.env.PORT || 9000;

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/testsmtp', async (req, res) => {
  try {
    await verify();
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get('/mail', async (req, res) => {
  const result = await sendMail();
  res.send(result);
});

app.get('/', async (req, res) => {
  const response = await crawl();
  res.json(response);
});

async function checkAndSendEmail() {
  const response = await crawl();
  const today = response[0];
  let high = false;

  today.times.forEach((time) => {
    if (high) return;

    if (time.numValue >= 4) high = true;
    if (high) {
      const messageContent = parse(today);
      sendMail(today.date, messageContent);
    }
  });
}

// eslint-disable-next-line no-unused-vars
const job = new CronJob(
  '0 0 16 * * *',
  () => {
    checkAndSendEmail();
  },
  null,
  true,
  'Europe/Oslo',
);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
