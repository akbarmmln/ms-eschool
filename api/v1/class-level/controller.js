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

    if (formatter.isEmpty(nama)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70007');
    }

    await adrClassLevel.create({
      id: uuid,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      is_deleted: 0,
      nama: nama
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

    if (formatter.isEmpty(id_kelas)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70001');
    }
    if (formatter.isEmpty(nama)) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70002');
    }

    await adrClassLevel.update({
      nama: nama,
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