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
const adrSettings = require('../../../model/adr_settings');
const adrTeacher = require('../../../model/adr_teacher');
const mailer = require('../../../config/mailer');
const s3 = require('../../../config/oss').client;

exports.getSetings = async function (req, res) {
  try {
    const settings = await adrSettings.findOne({
      raw: true,
      where: {
        is_deleted: 0,
      }
    })
    const teacher = await adrTeacher.findOne({
      raw: true,
      where: {
        jabatan: 'principal',
        is_deleted: 0
      }
    })

    return res.status(200).json(rsMsg('000000', {
      settings,
      teacher
    }))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/settings...', e);
  }
}

exports.sendMail = async function (req, res) {
  try {
    const subject = req.body.subject;
    const mailObject = {
      from: process.env.FROM_EMAIL,
      to: 'taufikfirman763@gmail.com',
      subject: subject,
      html: `<b>Hello dari Nodemailer + Brevo 🚀</b>`,
      // attachments: [
      //   {
      //     filename: 'hahaha.pdf',
      //     content: '// base64 format'
      //   }
      // ]
    };
    await mailer.resendMailer(mailObject);

    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/settings/send-email...', e);
  }
}

exports.alamatKodepos = async function (req, res) {
  try {
    const kodepos = req.params.kodepos;

    const dataWilayah = await sequelize.query(`SELECT mst_provinsi.nama AS nama_provinsi, mst_kota_kabupaten.nama AS kota_kabupaten,
      mst_kecamatan.nama AS kecamatan, mst_kelurahan.id AS id_kelurahan, mst_kelurahan.nama AS kelurahan, mst_kodepos.kodepos
      FROM mst_provinsi JOIN mst_kota_kabupaten
      ON mst_provinsi.id = mst_kota_kabupaten.id_provinsi
      JOIN mst_kecamatan
      ON mst_kota_kabupaten.id = mst_kecamatan.id_kabupaten
      JOIN mst_kelurahan
      ON mst_kecamatan.id = mst_kelurahan.id_kecamatan
      JOIN mst_kodepos
      ON mst_kelurahan.id = mst_kodepos.kode_kelurahan
      WHERE mst_kodepos.kodepos = :kodepos_`, {
      replacements: { kodepos_: kodepos },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    });

    return res.status(200).json(rsMsg('000000', dataWilayah))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/settings/alamat/kodepos/:kodepos...', e);
  }
}

exports.updateLembaga = async function (req, res) {
  try {
    const id = req.body.id;
    const objectUpdate = req.body.objectUpdate

    await adrSettings.update({
      ...objectUpdate,
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: req.id
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/settings/update/lembaga...', e);
  }
}

exports.uploadImagesSitus = async function (req, res) {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const fileImage = req.body.fileImage;
    const bufferImage = Buffer.from(fileImage, 'base64');
    const filetype = await utils.checkFiletipe(bufferImage);
    const mime = filetype.mime;

    const uploadPayload = {
      ACL: 'public-read',
      Bucket: 'bucket-sit',
      Key: `profile-situs/${name}`,
      Body: bufferImage,
      ContentEncoding: 'base64',
      ContentType: mime,
      CacheControl: 'no-cache'
    }
    let upload;

    if (name === 'logo') {
      upload = await s3.upload(uploadPayload).promise();
      await adrSettings.update({
        logo: upload?.Location ?? null
      }, {
        where: {
          id: id
        }
      })
    }
    
    const url_image = upload?.Location ?? null
    return res.status(200).json(rsMsg('000000', url_image))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/settings/situs-upload/images...', e);
  }
}