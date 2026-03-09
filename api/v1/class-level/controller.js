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
const adrClassLevel = require('../../../model/adr_class_level');
const adrClassRoom = require('../../../model/adr_class_room');
const adrClassLevelSilabus = require('../../../model/adr_class_level_silabus');

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

    const levelSilabus = await adrClassLevelSilabus.findAll({
      raw: true,
      where: {
        id_tingkat_kelas: id,
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
      ...data,
      class_room: allClassRoom,
      silabus: pushSilabus
    }

    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/class-level/detail...', e);
  }
}

exports.updateRelasiSilabus = async function (req, res) {
  try {
    const id = req.body.id;
    const items = req.body.items;

    const existingItems = await adrClassLevelSilabus.findAll({
      raw: true,
      where: {
        id_tingkat_kelas: id,
        is_deleted: 0
      }
    })
    const existingIds = existingItems.map(item => item.id_silabus);
    const existingSet = new Set(existingIds);
    const itemsSet = new Set(items);

    const toAdd = [...itemsSet].filter(id => !existingSet.has(id));
    const toDelete = [...existingSet].filter(id => !itemsSet.has(id));

    if (toAdd.length > 0) {
      for (let i=0; i<toAdd.length; i++) {
        await adrClassLevelSilabus.create({
          id: uuidv7(),
          created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
          created_by: 'req.id',
          is_deleted: 0,
          id_tingkat_kelas: id,
          id_silabus: toAdd[i]
        })
      }
    }

    if (toDelete.length > 0) {
      for (let i=0; i<toDelete.length; i++) {
        const dataWillDeleted = await adrClassLevelSilabus.findOne({
          raw: true,
          where: {
            id_tingkat_kelas: id,
            id_silabus: toDelete[i],
            is_deleted: 0
          }
        })
        if (dataWillDeleted) {
          await adrClassLevelSilabus.update({
            modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            modified_by: 'req.id',
            is_deleted: 1
          }, {
            where: {
              id: dataWillDeleted.id
            }
          })
        }
      }
    }

    return res.status(200).json(rsMsg('000000', {
      existingIds,
      toAdd,
      toDelete
    }))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/class-level/update/relasi-silabus...', e);
  }
}