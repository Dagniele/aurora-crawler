const nodemailer = require('nodemailer');

let credentials;
try {
  credentials = require('../secrets');
} catch (e) {
  console.log('secrets.js file missing');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

const options = {
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: credentials.sendinblue.auth.user,
    pass: credentials.sendinblue.auth.pass,
  },
};

const transporter = nodemailer.createTransport(options);

exports.sendMail = async (date, messageContent) => {
  const message = {
    from: 'Aurora Forecast <mail@bryllupiitalia.eu>',
    to: 'daniele.pagano@gmail.com',
    subject: `Aurora Forecast ${date}`,
    text: messageContent,
    html: `<p>${messageContent}</p>`,
  };

  try {
    return await transporter.sendMail(message);
  } catch (e) {
    return e;
  }
};

exports.verify = () =>
  new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify((error) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve('Server is ready to take our messages');
      }
    });
  });
