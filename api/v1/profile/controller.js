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
const adrTeacher = require('../../../model/adr_teacher');
const adrClassLevel = require('../../../model/adr_class_level');
const adrClassLevelSilabus = require('../../../model/adr_class_level_silabus');

exports.profile = async function (req, res) {
  try {
    const id = req.id;
    
    const profile = await adrTeacher.findOne({
      raw: true,
      where: {
        id: id
      }
    })

    const detailWaliKelas = await adrClassRoom.findOne({
      raw: true,
      where: {
        id_wakil_wali_kelas: id,
        is_deleted: 0
      }
    })

    const hasil = {
      ...profile,
      nama_kelas: detailWaliKelas?.nama_kelas
    }
    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/profile...', e);
  }
}