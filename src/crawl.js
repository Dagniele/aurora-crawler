const puppeteer = require('puppeteer');

function isVoid(char) {
  return char === undefined || char === ' ';
}

function removeUselessSpaces(str) {
  let tempString = '';

  for (let i = 0; i < str.length; i++) {
    const prevChar = str[i - 1];
    const currentChar = str[i];
    const nextChar = str[i + 1];

    if (currentChar !== ' ') {
      tempString += currentChar;
    } else if (!isVoid(prevChar) && !isVoid(nextChar) && isVoid(currentChar)) {
      tempString += currentChar;
    } else {
      tempString += '@';
    }
  }

  return tempString.split('@').filter((char) => char !== '');
}

module.exports = async function crawl() {
  if (process.env.MOCK) {
    return require('../mock/data.json');
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://www.aurora-service.eu/aurora-forecast/', {
    waitUntil: 'domcontentloaded',
  });

  const element = await page.$x("//pre[contains(., '00-03UT')]");

  const text = await (await element[0].getProperty('textContent')).jsonValue();
  const rows = text.split('\n');

  const dateRow = rows.shift();

  const dates = removeUselessSpaces(dateRow);

  const data = [
    {
      date: dates[0],
      times: [],
    },
    {
      date: dates[1],
      times: [],
    },
    {
      date: dates[2],
      times: [],
    },
  ];

  rows.forEach((row) => {
    if (row.length < 5) return;

    const result = removeUselessSpaces(row);

    const time = result.shift();

    data.forEach((date, index) => {
      date.times.push({
        time,
        stringValue: result[index],
        numValue: parseInt(result[index], 10),
      });
    });
  });

  await browser.close();

  return data;
};
