const logger = require('../config/logger');
const errMsg = require('../error/resError');
const BaseError = require('../error/baseError');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { v7: uuidv7 } = require('uuid');
const ApiErrorMsg = require('../error/apiErrorMsg');
const HttpStatusCode = require("../error/httpStatusCode");
const nodemailer = require('nodemailer');
const puppeteer = require("puppeteer");
const wkhtmltopdf = require('wkhtmltopdf');
const { Resend } = require('resend');

exports.returnErrorFunction = function (resObject, errorMessageLogger, errorObject) {
  logger.errorWithContext({ message: errorMessageLogger, error: errorObject });
  if (errorObject instanceof BaseError) {
    return resObject.status(errorObject.statusCode).json(errMsg(errorObject.errorCode, errorObject.description, errorObject?.errorDetails));
  } else {
    return resObject.status(500).json(errMsg('10000'));
  }
};

exports.enkrip = async function (payload) {
  try {
    const publickEncrypt = process.env.PUBLIC_KEY_GCM;
    const secretKey = payload.sessionLogin;

    const bodyKey = JSON.stringify(payload);
    const bodyString = bodyKey.replace(/ /gi, '');

    let encs = crypto.publicEncrypt(
      {
        key: publickEncrypt.replace(/\\n/gm, '\n'),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      }, Buffer.from(secretKey));
    encs = encs.toString("base64");

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(bodyString, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      buffer: Buffer.concat([encrypted, tag, iv]).toString('base64'),
      masterKey: encs
    }
  } catch (e) {
    logger.errorWithContext({message: 'error function enkrip...', error: e});
    throw e
  }
}

exports.signin = async function (hash) {
  try {
    const secret = require('../setting').secret;
    const privateKey = process.env.PRIVATE_KEY_JWT;

    const options = {
      issuer: 'eschool',
      algorithm: 'RS256',
      expiresIn: 3600,
    };
    const token = jwt.sign(
      hash,
      { key: privateKey.replace(/\\n/gm, '\n'), passphrase: secret },
      options,
    );
    return token;
  } catch (e) {
    logger.errorWithContext({message: 'error function signin...', error: e});
    throw e
  }
}

exports.verify = async function (token) {
  try {
    const publicKey = process.env.PUBLIC_KEY_JWT;

    const options = {
      issuer: 'eschool',
      algorithms: ['RS256']
    };

    const userToken = jwt.verify(
      token,
      publicKey.replace(/\\n/gm, '\n'),
      options
    );
    return userToken;
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error while verify jwt rs256' })
    throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70006');
  }
}

exports.dekrip = async function (masterkey, data) {
  try {
    const privateDecrypt = process.env.PRIVATE_KEY_GCM;

    let options = {
      key: privateDecrypt.replace(/\\n/gm, '\n'),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    };
    let dcs = crypto.privateDecrypt(options, Buffer.from(masterkey, "base64"));
    dcs = dcs.toString("utf8");

    const bufferData = Buffer.from(data, 'base64');
    const iv = Buffer.from(bufferData.slice(bufferData.length - 12, bufferData.length));
    const tag = Buffer.from(bufferData.slice(bufferData.length - 28, bufferData.length - 12));
    let cipherByte = Buffer.from(bufferData.slice(0, bufferData.length - 28));

    const decipher = crypto.createDecipheriv('aes-256-gcm', dcs, iv);
    decipher.setAuthTag(tag);

    let result = Buffer.concat([decipher.update(cipherByte), decipher.final()]);
    result = JSON.parse(result.toString())
    return result
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error while dekrip' })
    throw e
  }
}

exports.checkFiletipe = async function (buffer) {
  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const type = await fileTypeFromBuffer(buffer);

    return type
  } catch (e) {
    return {
      ext: null,
      mime: null
    }
  }
}

exports.resendMailer = async function (from, to, subject, html, attachments) {
  try {
    const resend = new Resend(process.env.SMTP_PASSWORD);
    let sendProps = {
      from: from,
      to: to,
      subject: subject,
      html: html,
    };
    if (attachments) {
      sendProps.attachments = attachments
    }
    const info = await resend.emails.send(sendProps);
    return info;
  } catch (e) {
    throw e;
  }
}

exports.sendGridMailer = async function (from, to, subject, body, attachments, bodyType = 'html') {
  try {
    const payloadNodemailer = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    }
    logger.infoWithContext(`payloadNodemailer nya ${JSON.stringify(payloadNodemailer)}`)
    let transporter = nodemailer.createTransport(payloadNodemailer);
    let sendProps = {
      from: from,
      to: to,
      subject: subject
    };

    if (bodyType !== 'html') {
      sendProps.text = body;
    } else {
      sendProps.html = body;
    }
    if (attachments) {
      sendProps.attachments = attachments
    }
    let info = await transporter.sendMail(sendProps);
    return info;
  } catch (e) {
    throw e;
  }
}

exports.pdfPupeeter = async function (htmlRender) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  await page.setContent(htmlRender, {
    waitUntil: "networkidle0",
    timeout: 60000
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "10mm",
      right: "10mm"
    },
    landscape: false,
    printBackground: true
  });
  await browser.close();
  return pdfBuffer;
}

exports.pdfWkhtml = (html) => {
  const options = {
    disableSmartShrinking: true,
    dpi: 96,
    zoom: 1.0,
    pageSize: 'A4',
    marginTop: '10mm',
    marginRight: '10mm',
    marginLeft: '10mm',
    marginBottom: '10mm',
  };

  return new Promise((resolve, reject) => {
    const pdfStream = wkhtmltopdf(html, options);
    const pdfBuffer = [];
    pdfStream.on('data', chunk => pdfBuffer.push(chunk));
    pdfStream.on('end', () => resolve(Buffer.concat(pdfBuffer)));
    pdfStream.on('error', err => reject(err));
  });
};