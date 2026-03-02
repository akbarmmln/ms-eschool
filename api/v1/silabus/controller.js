'use strict';

const { v7: uuidv7 } = require('uuid');

const moment = require('moment')
const utils = require('../../../utils/utils');
const sequelize = require('../../../config/db').Sequelize;
const Op = require('sequelize').Op;
const rsMsg = require('../../../response/rs');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrSilabus = require('../../../model/adr_silabus');
const adrSilabusItems = require('../../../model/adr_silabus_items');

exports.getSilabus = async function (req, res) {
  try {
    const search = req.params.search || '';
    const page = parseInt(req.params.page) || 1;
    const limit = 1
    const offset = (page - 1) * limit;
    
    adrSilabusItems.belongsTo(adrSilabus, {
      foreignKey: 'kode_silabus',
      targetKey: 'id'
    });

    let whereCondition = {
      is_deleted: 0
    };
    if (search) {
      whereCondition = {
        is_deleted: 0,
        [Op.or]: [
          { nama: { [Op.like]: `%${search}%` } },
          { '$items.nama$': { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await adrSilabus.findAndCountAll({
      subQuery: false, // 🔥 INI KUNCINYA
      distinct: true, // penting supaya count tidak duplicate
      col: 'id',
      limit,
      offset,
      order: [['created_dt', 'DESC']],
      where: whereCondition,
      include: [
        {
          model: adrSilabusItems,
          as: 'items', // pastikan relasi pakai alias ini
          where: { is_deleted: 0 },
          required: false
        }
      ]
    });

    const formattedData = rows.map(silabus => ({
      id: silabus.id,
      title: silabus.nama,
      items: silabus.items.map(item => ({
        id: item.id,
        name: item.nama
      }))
    }));

    return res.status(200).json(rsMsg('000000', {
      rows: formattedData,
      currentPage: page,
      totalPage: Math.ceil(count / limit),
      totalData: count
    }));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/silabus/list...', e);
  }
}

exports.createSilabus = async function (req, res) {
  const transaction = await sequelize.transaction();
  try {
    const id = uuidv7();
    const judul = req.body.judul;
    const items = req.body.items;

    let dataItems = []
    for (let i=0; i<items.length; i++) {
      const element = {
        id: uuidv7(),
        created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        created_by: req.id,
        is_deleted: 0,
        kode_silabus: id,
        nama: items[i]
      }
      dataItems.push(element)
    }

    await adrSilabus.create({
      id: id,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      is_deleted: 0,
      nama: judul
    }, { transaction: transaction })

    await adrSilabusItems.bulkCreate(dataItems, {
      transaction: transaction
    });

    await transaction.commit();
    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    if (transaction) {
      await transaction.rollback();
    }
    return utils.returnErrorFunction(res, 'error POST /api/v1/silabus/create...', e);
  }
}