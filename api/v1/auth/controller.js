'use strict';

const { v7: uuidv7 } = require('uuid');
const moment = require('moment')
const utils = require('../../../utils/utils');
const formatter = require('../../../config/format');
const Op = require('sequelize').Op;
const rsMsg = require('../../../response/rs');
const adrTeacher = require('../../../model/adr_teacher');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrClassRoom = require('../../../model/adr_class_room');

exports.login = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/auth/login...', e);
  }
}