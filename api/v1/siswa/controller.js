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

exports.getSiswa = async function (req, res) {
  try {
    let count, data;
    const search = req.params.search;
    const page = parseInt(req.params.page);
    const limit = 10;
    const offset = limit * (page - 1);

    if (search) {
      count = await sequelize.query(`SELECT COUNT(*) as count FROM adr_siswa JOIN adr_class_room ON adr_siswa.id_kelas = adr_class_room.id
        LEFT JOIN adr_teacher ON adr_class_room.id_wakil_wali_kelas = adr_teacher.id WHERE 
        adr_siswa.nik LIKE :nik_ or adr_siswa.nama LIKE :nama_ or adr_class_room.nama_kelas LIKE :nama_kelas_`,
        { replacements: { nik_: `%${search}%`, nama_: `%${search}%`, nama_kelas_: `%${search}%` }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });

      data = await sequelize.query(`SELECT adr_siswa.id, adr_siswa.nik, adr_siswa.nama as nama_siswa, adr_class_room.nama_kelas,
        adr_teacher.nama as nama_guru FROM adr_siswa JOIN adr_class_room ON adr_siswa.id_kelas = adr_class_room.id
        LEFT JOIN adr_teacher ON adr_class_room.id_wakil_wali_kelas = adr_teacher.id WHERE 
        adr_siswa.nik LIKE :nik_ or adr_siswa.nama LIKE :nama_ or adr_class_room.nama_kelas LIKE :nama_kelas_ LIMIT ${offset}, ${limit}`,
        { replacements: { nik_: `%${search}%`, nama_: `%${search}%`, nama_kelas_: `%${search}%` }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });

    } else {
      count = await sequelize.query(`SELECT COUNT(*) as count FROM adr_siswa JOIN adr_class_room ON adr_siswa.id_kelas = adr_class_room.id
        LEFT JOIN adr_teacher ON adr_class_room.id_wakil_wali_kelas = adr_teacher.id`,
        { type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });

      data = await sequelize.query(`SELECT adr_siswa.id, adr_siswa.nik, adr_siswa.nama as nama_siswa, adr_class_room.nama_kelas,
        adr_teacher.nama as nama_guru FROM adr_siswa JOIN adr_class_room ON adr_siswa.id_kelas = adr_class_room.id
        LEFT JOIN adr_teacher ON adr_class_room.id_wakil_wali_kelas = adr_teacher.id LIMIT ${offset}, ${limit}`,
        { type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });
    }
    
    if (data.length > 0) {
      const newRs = {
        rows: data,
        currentPage: page,
        totalPage: Math.ceil(count[0].count / limit),
        totalData: count[0].count,
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
    const kecamatan = req.body.kecamatan;
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

exports.searchSiswa = async function (req, res) {
  try {
    const id = req.params.id;

    const data = await sequelize.query(`SELECT adr_siswa.id, adr_siswa.nik, adr_siswa.nama as nama_siswa, 
        adr_siswa.jenis_kelamin, adr_siswa.tanggal_lahir, adr_siswa.alamat, adr_siswa.rt, adr_siswa.rw, 
        adr_siswa.kelurahan, adr_siswa.kecamatan, adr_class_room.nama_kelas, adr_teacher.nama as nama_guru 
        FROM adr_siswa JOIN adr_class_room ON adr_siswa.id_kelas = adr_class_room.id
        LEFT JOIN adr_teacher ON adr_class_room.id_wakil_wali_kelas = adr_teacher.id WHERE 
        adr_siswa.id = :id_`,
      { replacements: { id_: `${id}` }, type: sequelize.QueryTypes.SELECT },
      {
        raw: true
      });
    
    if (data.length == 0) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70008');
    }

    return res.status(200).json(rsMsg('000000', data.length ? data[0] : {}));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/siswa/search...', e);
  }
}