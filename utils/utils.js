const logger = require('../config/logger');
const errMsg = require('../error/resError');
const BaseError = require('../error/baseError');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { v7: uuidv7 } = require('uuid');

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
    throw e
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