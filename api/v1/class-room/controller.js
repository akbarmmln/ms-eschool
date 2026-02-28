'use strict';

const { v7: uuidv7 } = require('uuid');
const moment = require('moment')
const utils = require('../../../utils/utils');
const formatter = require('../../../config/format');
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const rsMsg = require('../../../response/rs');
const adrClassRoom = require('../../../model/adr_class_room');

exports.getClassRoom = async function (req, res) {
  try {
    let count, data;
    const search = req.params.search;
    const page = parseInt(req.params.page);
    const limit = 3;
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

    await adrClassRoom.create({
      id: uuid,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: 'req.id',
      modified_dt: null,
      modified_by: null,
      is_deleted: 0,
      nama_kelas: nama_kelas,
      id_wakil_wali_kelas: id_wali_kelas,
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

    await adrClassRoom.update({
      nama_kelas: nama_kelas,
      id_wakil_wali_kelas: id_wali_kelas,
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: 'req.id'
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