'use strict';

const { v7: uuidv7 } = require('uuid');
const moment = require('moment')
const utils = require('../../../utils/utils');
const formatter = require('../../../config/format');
const Op = require('sequelize').Op;
const rsMsg = require('../../../response/rs');
const adrTeacher = require('../../../model/adr_teacher');

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
  try {
    const uuid = await formatter.runNanoID(10)
    const nama = req.body.nama

    await adrTeacher.create({
      id: uuid,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: 'req.id',
      modified_dt: null,
      modified_by: null,
      is_deleted: 0,
      nama: nama
    })

    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/teacher/create...', e);
  }
}