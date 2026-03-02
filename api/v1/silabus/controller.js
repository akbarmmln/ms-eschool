'use strict';

const { v7: uuidv7 } = require('uuid');

const moment = require('moment')
const utils = require('../../../utils/utils');
const Op = require('sequelize').Op;
const sequelize = require('../../../config/db').Sequelize;
const rsMsg = require('../../../response/rs');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrSilabus = require('../../../model/adr_silabus');
const adrSilabusItems = require('../../../model/adr_silabus_items');

exports.getSilabus = async function (req, res) {
  try {
    let count, data;
    const search = req.params.search;
    const page = parseInt(req.params.page);
    const limit = 5;
    const offset = limit * (page - 1);

    if (search) {
      count = await adrSilabus.count({
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
      data = await adrSilabus.findAll({
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
      count = await adrSilabus.count({
        raw: true,
        where: { is_deleted: 0 }
      });
      data = await adrSilabus.findAll({
        limit: limit,
        offset: offset,
        raw: true,
        where: { is_deleted: 0 },
        order: [['created_dt', 'DESC']]
      });
    }

    if (data.length > 0) {
      let tempData = []
      for (let i=0; i< data.length; i++) {
        const kode_silabus = data[i].id;
        const title = data[i].nama;
        tempData.push({
          id: kode_silabus,
          title: title,
          items: []
        })
        
        const items_silabus = await adrSilabusItems.findAll({
          raw: true,
          where: {
            is_deleted: 0,
            kode_silabus: kode_silabus
          }
        })

        for (let j=0; j<items_silabus.length; j++) {
          tempData[i].items.push({
            id: items_silabus[j].id,
            name: items_silabus[j].nama
          })
        }
      }

      const newRs = {
        rows: tempData,
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

exports.detailSilabus = async function (req, res) {
  try {
    const id = req.params.id;

    const data = await adrSilabus.findOne({
      raw: true,
      where: {
        is_deleted: 0,
        id: id
      }
    })

    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70008');
    }

    let hasil = {
      id: id,
      title: data.nama,
      items: []
    }

    const details = await adrSilabusItems.findAll({
      raw: true,
      where: {
        is_deleted: 0,
        kode_silabus: id
      }
    })
    for (let i=0; i<details.length; i++) {
      hasil.items.push({
        id: details[i].id,
        name: details[i].nama
      })
    }

    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/silabus/detail...', e);
  }
}