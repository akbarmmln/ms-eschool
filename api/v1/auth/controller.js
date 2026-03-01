'use strict';

const { v7: uuidv7 } = require('uuid');
const moment = require('moment')
const utils = require('../../../utils/utils');
const formatter = require('../../../config/format');
const Op = require('sequelize').Op;
const rsMsg = require('../../../response/rs');
const adrTeacher = require('../../../model/adr_teacher');
const adrClassRoom = require('../../../model/adr_class_room');
const adrUserLogin = require('../../../model/adr_user_login');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const bcrypt = require('bcryptjs');
const saltRounds = 12;

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

    return res.status(200).json(rsMsg('000000', {}));
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

    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.header('Authorization', new_token);

    return res.status(200).json(rsMsg('000000', {}));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/verify-token...', e);
  }
}

exports.access = async function (req, res) {
  try {
    const token = req.body.authorization;

    if (!token) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70006');
    }

    const verifyRes = await utils.verify(token);
    const decrypt = await utils.dekrip(verifyRes.masterKey, verifyRes.buffer);

    return res.status(200).json(rsMsg('000000', decrypt))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/access...', e);
  }
}