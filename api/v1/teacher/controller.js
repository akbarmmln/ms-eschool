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
const otpGenerator = require('otp-generator');
const logger = require('../../../config/logger');
const sequelize = require('../../../config/db').Sequelize;

exports.getTeacherList = async function (req, res) {
  try {
    let count, data;
    const search = req.params.search;
    const page = parseInt(req.params.page);
    const limit = 3;
    const offset = limit * (page - 1);

    if (search) {
      count = await adrTeacher.count({
        raw: true,
        where: {
          [Op.and]: [
            {
              is_deleted: 0,
            },
            {
              [Op.or]: [
                { nama: { [Op.like]: `%${search}%` } },
              ]
            }
          ]
        }
      });

      data = await adrTeacher.findAll({
        limit: limit,
        offset: offset,
        raw: true,
        where: {
          [Op.and]: [
            {
              is_deleted: 0,
            },
            {
              [Op.or]: [
                { nama: { [Op.like]: `%${search}%` } },
              ]
            }
          ]
        },
        order: [['created_dt', 'DESC']]
      });
    } else {
      count = await adrTeacher.count({
        raw: true,
        where: { is_deleted: 0 }
      });
      data = await adrTeacher.findAll({
        limit: limit,
        offset: offset,
        raw: true,
        where: { is_deleted: 0 },
        order: [['created_dt', 'DESC']]
      });
    }

    if (data.length > 0) {
      const newRs = {
        rows: data,
        currentPage: page,
        totalPage: Math.ceil(count / limit),
        totalData: count,
      };
      return res.status(200).json(rsMsg('000000', newRs));
    } else {
      const newRs = {
        rows: [],
        currentPage: 1,
        totalPage: 1,
        totalData: 0,
      };
      return res.status(200).json(rsMsg('000000', newRs));
    }
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/teacher/list...', e);
  }
}

exports.searchTeacher = async function (req, res) {
  try {
    const keysearch = req.params.search

    const data = await adrTeacher.findAll({
      raw: true,
      where: {
        nama: { [Op.like]: `%${keysearch}%` }
      }
    })

    return res.status(200).json(rsMsg('000000', data))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/teacher/search...', e);
  }
}

exports.createTeacher = async function (req, res) {
  const transaction = await sequelize.transaction();
  try {
    const uuid = await formatter.runNanoID(10)
    const niy = req.body.niy
    const nama = req.body.nama
    const email = req.body.email;
    const pin = otpGenerator.generate(12, { digits: false, lowerCaseAlphabets: true, upperCaseAlphabets: true, specialChars: true });
    const encryptPin = await bcrypt.hash(pin, saltRounds);

    const cekEmail = await adrUserLogin.count({
      where: {
        email: email,
        is_deleted: 0
      }
    })
    if (cekEmail) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70004');
    }

    await adrUserLogin.create({
      id: uuidv7(),
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: 'req.id',
      is_deleted: 0,
      id_account: uuid,
      tipe_account: 'S01',
      password: encryptPin,
      role: 1,
      email: email
    }, { transaction: transaction })

    await adrTeacher.create({
      id: uuid,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: 'req.id',
      modified_dt: null,
      modified_by: null,
      is_deleted: 0,
      nama: nama,
      email: email,
      niy: niy
    }, { transaction: transaction })

    logger.infoWithContext(`password nya ${pin}`)
    await transaction.commit();
    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    if (transaction) {
      await transaction.rollback();
    }
    return utils.returnErrorFunction(res, 'error POST /api/v1/teacher/create...', e);
  }
}

exports.detailTeacher = async function (req, res) {
  try {
    const id = req.params.id;

    const data = await adrTeacher.findOne({
      raw: true,
      where:{
        id: id
      }
    })

    const dataWali = await adrClassRoom.findAll({
      raw: true,
      attributes: ['id', 'nama_kelas', 'id_wakil_wali_kelas'],
      where: {
        id_wakil_wali_kelas: id
      }
    })

    const hasil = {
      ...data,
      kelas: dataWali
    }
    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/teacher/detail...', e);
  }
}

exports.updateTeacher = async function (req, res) {
  try {
    const id = req.body.id;
    const object_update = req.body.object_update;

    await adrTeacher.update({
      ...object_update
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/teacher/update...', e);
  }
}

exports.deleteTeacher = async function (req, res) {
  try {
    const id = req.body.id;

    if (formatter.isEmpty(id)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70001');
    }

    await adrTeacher.update({
      is_deleted: 1,
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/teacher/update...', e);
  }
}