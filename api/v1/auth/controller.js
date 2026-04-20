'use strict';

const { v7: uuidv7 } = require('uuid');
const moment = require('moment')
const utils = require('../../../utils/utils');
const formatter = require('../../../config/format');
const Op = require('sequelize').Op;
const rsMsg = require('../../../response/rs');
const adrAuthOtp = require('../../../model/adr_auth_otp');
const adrUserLogin = require('../../../model/adr_user_login');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const adrSettings = require('../../../model/adr_settings');
const otpGenerator = require('otp-generator');
const emailTemplate = require('../../../config/email-template/template');
const mailer = require('../../../config/mailer');

exports.login = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let sessionLogin = uuidv7();
    sessionLogin = sessionLogin.replace(/-/g, "");

    const data = await adrUserLogin.findOne({
      raw: true,
      where: {
        email: email
      }
    })

    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70005');
    }

    const passwordRegistered = data.password
    const checkPin = await bcrypt.compare(password, passwordRegistered);

    if (!checkPin) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70005');
    }

    const settings = await adrSettings.findOne({
      raw: true,
      where: {
        is_deleted: 0
      }
    })

    const payloadEnkripsiLogin = {
      id_account: data.id_account,
      role: data.role,
      tipe_account: data.tipe_account,
      sessionLogin: sessionLogin
    }
    const hash = await utils.enkrip(payloadEnkripsiLogin);        
    const token = await utils.signin(hash);

    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.header('Authorization', token);

    return res.status(200).json(rsMsg('000000', settings));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/login...', e);
  }
}

exports.verifyToken = async function (req, res, next) {
  try {
    const token = req.headers['authorization'];
    let sessionLogin = uuidv7();
    sessionLogin = sessionLogin.replace(/-/g, "");

    if (!token) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70006');
    }

    const verifyRes = await utils.verify(token);
    const decrypt = await utils.dekrip(verifyRes.masterKey, verifyRes.buffer);

    const payloadEnkripsiLogin = {
      id_account: decrypt.id_account,
      role: decrypt.role,
      tipe_account: decrypt.tipe_account,
      sessionLogin: sessionLogin
    }
    const hash = await utils.enkrip(payloadEnkripsiLogin);        
    const new_token = await utils.signin(hash);

    req.id = payloadEnkripsiLogin.id_account
    req.role = payloadEnkripsiLogin.role
    req.tipe_account = payloadEnkripsiLogin.tipe_account

    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.header('Authorization', new_token);

    next();
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/verify-token...', e);
  }
}

exports.access = async function (req, res) {
  try {
    const token = req.body.authorization;
    let sessionLogin = uuidv7();
    sessionLogin = sessionLogin.replace(/-/g, "");

    if (!token) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70006');
    }

    const verifyRes = await utils.verify(token);
    const decrypt = await utils.dekrip(verifyRes.masterKey, verifyRes.buffer);

    const payloadEnkripsiLogin = {
      id_account: decrypt.id_account,
      role: decrypt.role,
      tipe_account: decrypt.tipe_account,
      sessionLogin: sessionLogin
    }
    const hash = await utils.enkrip(payloadEnkripsiLogin);        
    const new_token = await utils.signin(hash);

    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.header('Authorization', new_token);

    return res.status(200).json(rsMsg('000000', decrypt))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/access...', e);
  }
}

exports.invForPass =  async function (req, res) {
  try {
    const id = uuidv7();
    const session = id.replace(/-/g, "");
    const email = req.body.email;
    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    const validUntil = moment().add(3, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const counter = 3;

    if (formatter.isEmpty(email)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70017');
    }

    const data = await adrAuthOtp.findOne({
      raw: true,
      where: {
        email: email
      }
    })
    
    const enkripsiForPass = {
      id: id,
      sessionLogin: session,
      email: email
    }
    const hash = await utils.enkrip(enkripsiForPass);
    const token = await utils.signin(hash, 180);

    const mailObject = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'OTP Perubahan Kata Sandi',
      html: await emailTemplate.forgetPasswordEmail({
        email: email,
        otp: otp
      }),
    };

    if (!data) {
      await adrAuthOtp.create({
        id: uuidv7(),
        session: session,
        code: otp,
        counter: counter,
        valid_until_dt: validUntil,
        next_sent: validUntil,
        otp_validate: 0,
        jwt: token,
        email: email
      })
      await mailer.resendMailer(mailObject);
      return res.status(200).json(rsMsg('000000', {
        jwt: token
      }))
    } else {
      if (data && moment().isSameOrAfter(data.next_sent) || data.otp_validate == 1) {
        await adrAuthOtp.update({
          session: session,
          code: otp,
          counter: counter,
          valid_until_dt: validUntil,
          next_sent: validUntil,
          otp_validate: 0,
          jwt: token,
        }, {
          where: {
            id: data.id
          }
        })
        await mailer.resendMailer(mailObject);
        return res.status(200).json(rsMsg('000000', {
          jwt: token
        }))
      } else {
        return res.status(200).json(rsMsg('000000', {
          jwt: data.jwt
        }))
      }
    }
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/invalidate-forgot-password...', e);
  }
}

exports.invalPage = async function (req, res) {
  try {
    const jwt = req.params.jwt;

    if (formatter.isEmpty(jwt)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70020');
    }

    const verifyRes = await utils.verify(jwt);
    const decrypt = await utils.dekrip(verifyRes.masterKey, verifyRes.buffer);
    const session = decrypt.sessionLogin;

    const data = await adrAuthOtp.findOne({
      raw: true,
      where: {
        session: session
      }
    })

    if (data && data.otp_validate == 0) {
      const valid_until_dt = moment(data.valid_until_dt);
      const inSecond = moment(valid_until_dt, 'YYYY-MM-DD HH:mm:ss').diff(moment(), 'seconds');
      const hasil = {
        jwt: data.jwt,
        valid_until_dt: data.valid_until_dt,
        next_sent: data.next_sent,
        counter: data.counter,
        session: data.session,
        inSecond: inSecond
      }

      return res.status(200).json(rsMsg('000000', hasil))
    } else {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70021');
    }    
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/auth/invalidate-page...', e);
  }
}

exports.verifyOTP = async function (req, res) {
  try {
    const type = req.body.type;
    const otp = req.body.otp;
    const jwt = req.body.jwt

    const verifyRes = await utils.verify(jwt);
    const decrypt = await utils.dekrip(verifyRes.masterKey, verifyRes.buffer);
    const session = decrypt.sessionLogin;

    const data = await adrAuthOtp.findOne({
      raw: true,
      where: {
        session: session,
      }
    })

    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70020');
    }

    const id = data.id;
    let counter = data.counter;
    const otpIn = data.code;

    if (counter > 0) {
      if (otp !== otpIn) {
        counter--;

        await adrAuthOtp.update({
          counter: counter
        }, {
          where: {
            id: id
          }
        })

        if (counter == 0) {
          throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70023');
        }

        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70022');
      } else {
        await adrAuthOtp.update({
          otp_validate: 1
        }, {
          where: {
            id: id
          }
        })
      }
    } else {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70023');
    }

    return res.status(200).json(rsMsg('000000', session))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/verify-otp...', e);
  }
}

exports.invPassword = async function (req, res) {
  try {
    const password = req.body.password;
    const session = req.body.session;

    const data = await adrAuthOtp.findOne({
      raw: true,
      where: {
        session: session,
        otp_validate: 1
      }
    })

    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70024');
    }

    const encryptPin = await bcrypt.hash(password, saltRounds);
    const email = data.email;

    await adrUserLogin.update({
      password: encryptPin,
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: 'FORGOT-PASSWORD'
    }, {
      where: {
        email: email
      }
    })

    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/invalidate/password...', e);
  }
}