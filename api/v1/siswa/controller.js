'use strict';

const { v7: uuidv7 } = require('uuid');

const moment = require('moment')
const utils = require('../../../utils/utils');
const Op = require('sequelize').Op;
const sequelize = require('../../../config/db').Sequelize;
const rsMsg = require('../../../response/rs');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrSiswa = require('../../../model/adr_siswa');
const adrParents = require('../../../model/adr_parents');
const { email } = require('../../../setting');

exports.getSiswa = async function (req, res) {
  try {
    let count, data;
    const search = req.params.search;
    const page = parseInt(req.params.page);
    const limit = 5;
    const offset = limit * (page - 1);

    if (search) {
      count = await adrSiswa.count({
        raw: true,
        where: {
          [Op.and]: [
            {
              is_deleted: 0,
            },
            {
              [Op.or]: [
                { nama: { [Op.like]: `%${search}%` } },
                { nik: { [Op.like]: `%${search}%` } },
              ]
            }
          ]
        }
      });
      data = await adrSiswa.findAll({
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
                { nik: { [Op.like]: `%${search}%` } },
              ]
            }
          ]
        },
        order: [['created_dt', 'DESC']]
      });
    } else {
      count = await adrSiswa.count({
        raw: true,
        where: { is_deleted: 0 }
      });
      data = await adrSiswa.findAll({
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
    return utils.returnErrorFunction(res, 'error GET /api/v1/siswa/list...', e);
  }
}

exports.createSiswa = async function (req, res) {
  const transaction = await sequelize.transaction();
  try {
    let idParent;
    const idSiswa = uuidv7();
    const nik = req.body.nik;
    const nama_lengkap = req.body.nama_lengkap;
    const jenis_kelamin = req.body.jenis_kelamin;
    const tanggal_lahir = req.body.tanggal_lahir;
    const alamat = req.body.alamat;
    const no_rt = req.body.no_rt;
    const no_rw = req.body.no_rw;
    const kelurahan = req.body.kelurahan;
    const kecamatan = req.body.nik;
    const id_kelas = req.body.id_kelas;
    const nama_ayah = req.body.nama_ayah;
    const nama_ibu = req.body.nama_ibu;
    const email_aktif = req.body.email_aktif;
    const ocup_ayah = req.body.ocup_ayah;
    const ocup_ibu = req.body.ocup_ibu;
    const image = req.body.image;

    const dataParent = await adrParents.findOne({
      raw: true,
      where: {
        email: email_aktif
      }
    })
    if (dataParent) {
      idParent = dataParent.id
    } else {
      idParent = uuidv7();
      await adrParents.create({
        id: idParent,
        created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        created_by: req.id,
        is_deleted: 0,
        nama_ayah: nama_ayah,
        nama_ibu: nama_ibu,
        email: email_aktif,
        pekerjaan_ayah: ocup_ayah,
        pekerjaan_ibu: ocup_ibu
      }, { transaction: transaction })
    }

    await adrSiswa.create({
      id: idSiswa,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      is_deleted: 0,
      nama: nama_lengkap,
      jenis_kelamin: jenis_kelamin,
      tanggal_lahir: moment(tanggal_lahir, 'MM-DD-YYYY').format('YYYY-MM-DD 00:00:00'),
      nik: nik,
      alamat: alamat,
      rt: no_rt,
      rw: no_rw,
      kelurahan: kelurahan,
      kecamatan: kecamatan,
      id_kelas: id_kelas,
      id_parent: idParent,
      image: image
    }, {transaction: transaction})

    await transaction.commit();
    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    if (transaction) {
      await transaction.rollback()
    }
    return utils.returnErrorFunction(res, 'error POST /api/v1/siswa/create...', e);
  }
}