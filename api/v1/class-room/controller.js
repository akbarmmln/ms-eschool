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

exports.getClassRoom = async function (req, res) {
  try {
    let count, data;
    const search = req.params.search;
    const page = parseInt(req.params.page);
    const limit = 10;
    const offset = limit * (page - 1);
    const attributes = [
      'id',
      'nama_kelas',
      [
        sequelize.literal(`(SELECT id FROM adr_teacher where id = adr_class_room.id_wakil_wali_kelas)`),
        'id_wali_kelas',
      ],
      [
        sequelize.literal(`(SELECT nama FROM adr_teacher where id = adr_class_room.id_wakil_wali_kelas)`),
        'wali_kelas',
      ],
      [
        sequelize.literal(`(SELECT id FROM adr_class_level where id = adr_class_room.id_tingkat_kelas)`),
        'id_tingkat_kelas',
      ],
      [
        sequelize.literal(`(SELECT nama FROM adr_class_level where id = adr_class_room.id_tingkat_kelas)`),
        'nama_tingkat_kelas',
      ]
    ];

    if (search) {
      count = await adrClassRoom.count({
        raw: true,
        where: {
          [Op.and]: [
            {
              is_deleted: 0,
            },
            {
              [Op.or]: [
                { nama_kelas: { [Op.like]: `%${search}%` } },
              ]
            }
          ]
        }
      });

      data = await adrClassRoom.findAll({
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
                { nama_kelas: { [Op.like]: `%${search}%` } },
              ]
            }
          ]
        },
        order: [['created_dt', 'DESC']]
      });
    } else {
      count = await adrClassRoom.count({
        raw: true,
        where: { is_deleted: 0 }
      });
      data = await adrClassRoom.findAll({
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
    return utils.returnErrorFunction(res, 'error GET /api/v1/class-room/list...', e);
  }
}

exports.createClassRoom  = async function (req, res) {
  try {
    const uuid = await formatter.runNanoID(10)
    const nama_kelas = req.body.nama_kelas;
    const id_wali_kelas = req.body.id_wali_kelas;
    const id_tingkatan_kelas = req.body.id_tingkatan_kelas;

    if (formatter.isEmpty(nama_kelas)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70002');
    }
    if (formatter.isEmpty(id_tingkatan_kelas)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70009');
    }

    await adrClassRoom.create({
      id: uuid,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      modified_dt: null,
      modified_by: null,
      is_deleted: 0,
      nama_kelas: nama_kelas,
      id_wakil_wali_kelas: id_wali_kelas,
      id_tingkat_kelas: id_tingkatan_kelas
    })

    return res.status(200).json(rsMsg('000000'));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/class-room/create...', e);
  }
}

exports.updateClassRoom = async function (req, res) {
  try {
    const id_kelas = req.body.id_kelas;
    const nama_kelas = req.body.nama_kelas;
    const id_wali_kelas = req.body.id_wali_kelas;
    const id_tingkatan_kelas = req.body.id_tingkatan_kelas;

    if (formatter.isEmpty(nama_kelas)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70002');
    }
    if (formatter.isEmpty(id_wali_kelas)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70003');
    }
    if (formatter.isEmpty(id_tingkatan_kelas)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70009');
    }

    await adrClassRoom.update({
      nama_kelas: nama_kelas,
      id_wakil_wali_kelas: id_wali_kelas,
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: req.id,
      id_tingkat_kelas: id_tingkatan_kelas
    }, {
      where: {
        id: id_kelas
      }
    })

    return res.status(200).json(rsMsg('000000'));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/class-room/update...', e);
  }
}

exports.deleteClassRoom = async function (req, res) {
  try {
    const id = req.body.id;

    if (formatter.isEmpty(id)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70001');
    }

    await adrClassRoom.update({
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
    return utils.returnErrorFunction(res, 'error POST /api/v1/class-room/delete...', e);
  }
}

exports.searchClassRoom = async function (req, res) {
  try {
    const keysearch = req.params.search

    const data = await adrClassRoom.findAll({
      raw: true,
      where: {
        nama_kelas: { [Op.like]: `%${keysearch}%` }
      }
    })

    return res.status(200).json(rsMsg('000000', data))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/class-room/search...', e);
  }
}

exports.detailClassRoom = async function (req, res) {
  try {
    const id = req.params.id

    const countData = await adrClassRoom.count({
      where: {
        id: id,
        is_deleted: 0
      }
    })

    if (!countData) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70008');
    }

    const data = await adrClassRoom.findOne({
      raw: true,
      where: {
        id: id,
        is_deleted: 0
      }
    })

    const detailWaliKelas = await adrTeacher.findOne({
      raw: true,
      where: {
        id: data.id_wakil_wali_kelas,
        is_deleted: 0
      }
    })
    const detailTingkatKelas = await adrClassLevel.findOne({
      raw: true,
      where: {
        id: data.id_tingkat_kelas,
        is_deleted: 0
      }
    })

    const levelSilabus = await adrClassLevelSilabus.findAll({
      raw: true,
      where: {
        id_tingkat_kelas: data.id_tingkat_kelas,
        is_deleted: 0
      }
    })
    let pushSilabus = [];
    if (levelSilabus.length > 0) {
      for (let i = 0; i < levelSilabus.length; i++) {
        const silabus = await sequelize.query(`SELECT adr_silabus.id, adr_silabus.nama, 
        adr_silabus_items.id as item_id, adr_silabus_items.nama as nama_item
        FROM adr_silabus LEFT JOIN adr_silabus_items
        ON adr_silabus.id = adr_silabus_items.kode_silabus
        where adr_silabus.id = :id_ AND adr_silabus.is_deleted = '0'`,
          { replacements: { id_: `${levelSilabus[i].id_silabus}` }, type: sequelize.QueryTypes.SELECT },
          {
            raw: true
          });

        if (silabus.length) {
          const result = {
            id: silabus[0]?.id,
            title: silabus[0]?.nama,
            items: silabus
              .filter(item => item.nama_item !== null)
              .map(item => ({
                id: item?.item_id,
                nama_item: item?.nama_item
              }))
          };
          pushSilabus.push(result)
        }
      }
    }

    const hasil = {
      ruang_kelas: data,
      wali_kelas: detailWaliKelas,
      tingkat_kelas: detailTingkatKelas,
      silabus: pushSilabus
    }

    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/class-room/detail...', e);
  }
}