'use strict';

const { v7: uuidv7 } = require('uuid');
const moment = require('moment')
const utils = require('../../../utils/utils');
const formatter = require('../../../config/format');
const Op = require('sequelize').Op;
const sequelize = require('../../../config/db').Sequelize;
const rsMsg = require('../../../response/rs');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrClassRoom = require('../../../model/adr_class_room');
const adrSettings = require('../../../model/adr_settings');
const adrTeacher = require('../../../model/adr_teacher');

exports.getSetings = async function (req, res) {
  try {    
    const settings = await adrSettings.findOne({
      raw: true,
      where: {
        is_deleted: 0,
      }
    })
    const teacher = await adrTeacher.findOne({
        raw: true,
        where: {
            jabatan: 'principal',
            is_deleted: 0
        }
    })
    
    return res.status(200).json(rsMsg('000000', {
        settings,
        teacher
    }))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/profile...', e);
  }
}