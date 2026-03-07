'use strict';

const { v7: uuidv7 } = require('uuid');
const moment = require('moment')
const utils = require('../../../utils/utils');
const formatter = require('../../../config/format');
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const rsMsg = require('../../../response/rs');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrClassLevel = require('../../../model/adr_class_level');
const adrClassRoom = require('../../../model/adr_class_room');

exports.getClassLevel = async function (req, res) {
  try {
    let count, data;
    const search = req.params.search;
    const page = parseInt(req.params.page);
    const limit = 10;
    const offset = limit * (page - 1);
    const attributes = [
      'id',
      'nama',
      'deskripsi'
    ];

    if (search) {
      count = await adrClassLevel.count({
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

      data = await adrClassLevel.findAll({
        limit: limit,
        offset: offset,
        raw: true,
        attributes: attributes,
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
      count = await adrClassLevel.count({
        raw: true,
        where: { is_deleted: 0 }
      });
      data = await adrClassLevel.findAll({
        limit: limit,
        offset: offset,
        raw: true,
        attributes: attributes,
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
    return utils.returnErrorFunction(res, 'error GET /api/v1/class-level/list...', e);
  }
}

exports.createClassLevel = async function (req, res) {
  try {
    const uuid = await formatter.runNanoID(10)
    const nama = req.body.nama;
    const deskripsi = req.body.deskripsi;

    if (formatter.isEmpty(nama)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70007');
    }

    await adrClassLevel.create({
      id: uuid,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      is_deleted: 0,
      nama: nama,
      deskripsi: deskripsi
    })

    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/class-level/create...', e);
  }
}

exports.deleteClassLevel = async function (req, res) {
  try {
    const id = req.body.id;

    if (formatter.isEmpty(id)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70001');
    }

    await adrClassLevel.update({
      is_deleted: 1,
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: req.id
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/class-level/delete...', e);
  }
}

exports.updateClassLevel = async function (req, res) {
  try {
    const id = req.body.id;
    const nama = req.body.nama;
    const deskripsi = req.body.deskripsi;

    if (formatter.isEmpty(id)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70001');
    }
    if (formatter.isEmpty(nama)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70002');
    }

    await adrClassLevel.update({
      nama: nama,
      deskripsi: deskripsi,
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: req.id
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsMsg('000000', {}));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/class-level/update...', e);
  }
}

exports.getLevelClass = async function (req, res) {
  try {
    const data = await adrClassLevel.findAll({
      raw: true,
      where: {
        is_deleted: 0
      }
    })

    return res.status(200).json(rsMsg('000000', data))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/class-level/level...', e);
  }
}

exports.getDetailLevelClass = async function (req, res) {
  try {
    const id = req.params.id;

    const countData = await adrClassLevel.count({
      where: {
        id: id,
        is_deleted: 0
      }
    })

    if (!countData) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70008');
    }

    const data = await adrClassLevel.findOne({
      raw: true,
      where: {
        id: id,
        is_deleted: 0
      }
    })

    const attributes_class_room = [
      'id',
      'nama_kelas',
      [
        sequelize.literal(`(SELECT id FROM adr_teacher where id = adr_class_room.id_wakil_wali_kelas)`),
        'id_wali_kelas',
      ],
      [
        sequelize.literal(`(SELECT nama FROM adr_teacher where id = adr_class_room.id_wakil_wali_kelas)`),
        'wali_kelas',
      ]
    ];
    const allClassRoom = await adrClassRoom.findAll({
      raw: true,
      attributes: attributes_class_room,
      where: {
        id_tingkat_kelas: data.id,
        is_deleted: 0
      }
    })

    const hasil = {
      ...data,
      class_room: allClassRoom
    }

    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/class-level/detail...', e);
  }
}