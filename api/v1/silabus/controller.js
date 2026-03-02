'use strict';

const { v7: uuidv7 } = require('uuid');

const moment = require('moment')
const utils = require('../../../utils/utils');
const sequelize = require('../../../config/db').Sequelize;
const rsMsg = require('../../../response/rs');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrSilabus = require('../../../model/adr_silabus');
const adrSilabusItems = require('../../../model/adr_silabus_items');

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