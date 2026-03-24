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
const bcrypt = require('bcryptjs');
const adrUserLogin = require('../../../model/adr_user_login');

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

exports.updatePersonal = async function (req, res) {
  try {
    const id = req.id;
    const object_update = req.body.object_update;

    await adrTeacher.update({
      ...object_update,
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: req.id
    }, {
      where: {
        id: id
      }
    })
    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/profile/update-personal...', e);
  }
}

exports.ubahPassword = async function (req, res) {
  try {
    const id = req.id;

    const password_lama = req.body.password_lama;
    const password_baru = req.body.password_baru;

    const data = await adrUserLogin.findOne({
      raw: true,
      where: {
        id_account: id
      }
    })

    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70008');
    }

    const passwordRegistered = data.password
    const checkPin = await bcrypt.compare(password_lama, passwordRegistered);
    if (!checkPin) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70015');
    }

    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/profile/change/password...', e);
  }
}