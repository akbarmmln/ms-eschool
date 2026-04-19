'use strict';

require('dotenv').config();
const utils = require('../utils/utils');
const logger = require('./logger');

exports.sendMailer = async function (mailObject) {
  try {
    const response = await utils.sendGridMailer(mailObject.from, mailObject.to, mailObject.subject, mailObject.html, mailObject.attachments);
    return response;
  } catch (e) {
    logger.errorWithContext({ message: 'failed to send email', error: e });
    throw e;
  }
}

exports.resendMailer = async function (mailObject) {
  try {
    const response = await utils.resendMailer(mailObject.from, mailObject.to, mailObject.subject, mailObject.html, mailObject.attachments);
    return response;
  } catch (e) {
    logger.errorWithContext({ message: 'failed to send email', error: e });
    return e
  }
}