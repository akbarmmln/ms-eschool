'use strict';

const { v7: uuidv7 } = require('uuid');

const moment = require('moment')
const utils = require('../../../utils/utils');
const Op = require('sequelize').Op;
const logger = require('../../../config/logger')
const sequelize = require('../../../config/db').Sequelize;
const rsMsg = require('../../../response/rs');
const ApiErrorMsg = require('../../../error/apiErrorMsg');
const HttpStatusCode = require("../../../error/httpStatusCode");
const adrSiswa = require('../../../model/adr_siswa');
const adrParents = require('../../../model/adr_parents');
const { isEmpty } = require('../../../config/format');
const s3 = require('../../../config/oss').client;

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
        adr_siswa.nik LIKE :nik_ OR adr_siswa.nama LIKE :nama_ OR adr_class_room.nama_kelas LIKE :nama_kelas_ OR adr_teacher.nama LIKE :nama_guru_`,
        { replacements: { nik_: `%${search}%`, nama_: `%${search}%`, nama_kelas_: `%${search}%`, nama_guru_: `%${search}%` }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });

      data = await sequelize.query(`SELECT adr_siswa.id, adr_siswa.nik, adr_siswa.nama as nama_siswa, adr_class_room.nama_kelas,
        adr_teacher.nama as nama_guru FROM adr_siswa JOIN adr_class_room ON adr_siswa.id_kelas = adr_class_room.id
        LEFT JOIN adr_teacher ON adr_class_room.id_wakil_wali_kelas = adr_teacher.id WHERE 
        adr_siswa.nik LIKE :nik_ OR adr_siswa.nama LIKE :nama_ OR adr_class_room.nama_kelas LIKE :nama_kelas_ OR adr_teacher.nama LIKE :nama_guru_ LIMIT ${offset}, ${limit}`,
        { replacements: { nik_: `%${search}%`, nama_: `%${search}%`, nama_kelas_: `%${search}%`, nama_guru_: `%${search}%` }, type: sequelize.QueryTypes.SELECT },
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
    let urlImage = null;
    
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

    if (!isEmpty(image)) {
      const buf = Buffer.from(image, 'base64')
      const filetype = await utils.checkFiletipe(buf);
      const ext = filetype.ext;
      const mime = filetype.mime;

      const upload = await s3.upload({
        ACL: 'public-read',
        Bucket: 'bucket-sit',
        Key: `profile-picture/${uuidv7()}.${ext}`,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: mime,
      }).promise();

      urlImage = upload?.Location ?? null
    }


    await adrSiswa.create({
      id: idSiswa,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      is_deleted: 0,
      nama: nama_lengkap,
      jenis_kelamin: jenis_kelamin,
      tanggal_lahir: moment(tanggal_lahir, 'DD-MM-YYYY').format('YYYY-MM-DD 00:00:00'),
      nik: nik,
      alamat: alamat,
      rt: no_rt,
      rw: no_rw,
      kelurahan: kelurahan,
      kecamatan: kecamatan,
      id_kelas: id_kelas,
      id_parent: idParent,
      image: urlImage
    }, {transaction: transaction})

    await transaction.commit();
    return res.status(200).json(rsMsg('000000', {}));
  } catch (e) {
    if (transaction) {
      await transaction.rollback()
    }
    return utils.returnErrorFunction(res, 'error POST /api/v1/siswa/create...', e);
  }
}

exports.updateSiswa = async function (req, res) {
  const transaction = await sequelize.transaction();
  try {
    const id_siswa = req.body.id_siswa;
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
    const id_parent = req.body.id_parent;
    const nama_ayah = req.body.nama_ayah;
    const nama_ibu = req.body.nama_ibu;
    const email_aktif = req.body.email_aktif;
    const ocup_ayah = req.body.ocup_ayah;
    const ocup_ibu = req.body.ocup_ibu;
    const image = req.body.image;
    const change_image = req.body.change_image;

    const paylaodOrtuWillUpdate = {
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: req.id,
      nama_ayah: nama_ayah,
      nama_ibu: nama_ibu,
      email: email_aktif,
      pekerjaan_ayah: ocup_ayah,
      pekerjaan_ibu: ocup_ibu
    }

    let paylaodSiswaWillUpdate = {
      modified_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      modified_by: req.id,
      nama: nama_lengkap,
      jenis_kelamin: jenis_kelamin,
      tanggal_lahir: moment(tanggal_lahir, 'DD-MM-YYYY').format('YYYY-MM-DD 00:00:00'),
      nik: nik,
      alamat: alamat,
      rt: no_rt,
      rw: no_rw,
      kelurahan: kelurahan,
      kecamatan: kecamatan,
      id_kelas: id_kelas
    }
    if (change_image && isEmpty(image)) {
      paylaodSiswaWillUpdate.image = null;
    } else if (change_image && !isEmpty(image)) {
      const buf = Buffer.from(image, 'base64')
      const filetype = await utils.checkFiletipe(buf);
      const ext = filetype.ext;
      const mime = filetype.mime;

      const upload = await s3.upload({
        ACL: 'public-read',
        Bucket: 'bucket-sit',
        Key: `profile-picture/${uuidv7()}.${ext}`,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: mime,
      }).promise();

      const urlImage = upload?.Location ?? null
      paylaodSiswaWillUpdate.image = urlImage;
    }

    await adrSiswa.update(paylaodSiswaWillUpdate, {
      where: {
        id: id_siswa
      }, transaction
    })

    await adrParents.update(paylaodOrtuWillUpdate, {
      where: {
        id: id_parent
      }, transaction
    })

    await transaction.commit();
    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    if (transaction) {
      await transaction.rollback()
    }
    return utils.returnErrorFunction(res, 'error POST /api/v1/siswa/update...', e);
  }
}

exports.searchSiswa = async function (req, res) {
  try {
    const id = req.params.id;

    const data = await sequelize.query(`SELECT adr_siswa.id, adr_siswa.nik, adr_siswa.nama as nama_siswa, 
        adr_siswa.jenis_kelamin, adr_siswa.tanggal_lahir, adr_siswa.alamat, adr_siswa.rt, adr_siswa.rw, 
        adr_siswa.kelurahan, adr_siswa.kecamatan, adr_siswa.image, 
        adr_class_room.id as id_kelas, adr_class_room.nama_kelas, 
        adr_teacher.id as id_guru, adr_teacher.nama as nama_guru, 
        adr_parents.id as id_parent, adr_parents.nama_ayah, adr_parents.nama_ibu, adr_parents.email, 
        adr_parents.pekerjaan_ayah, adr_parents.pekerjaan_ibu
        FROM adr_siswa JOIN adr_class_room ON adr_siswa.id_kelas = adr_class_room.id
        LEFT JOIN adr_teacher ON adr_class_room.id_wakil_wali_kelas = adr_teacher.id 
        LEFT JOIN adr_parents ON adr_siswa.id_parent = adr_parents.id
        WHERE adr_siswa.id = :id_`,
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

exports.getAbsensi = async function (req, res) {
  try {
    const id_siswa = req.body.id_siswa;
    const dari = req.body.dari;
    const sampai = req.body.sampai;
    let data;

    if (dari && sampai) {
      const dateDari = moment(dari, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const dateSampai = moment(sampai, 'DD-MM-YYYY').format('YYYY-MM-DD');

      if (dateDari > dateSampai) {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70014');
      }

      data = await sequelize.query(`SELECT ajm.id as id_jurnal, ajmds.id as id_details, ajmds.id_siswa,
        ajm.tanggal_jurnal, ajm.materi, ajm.refleksi,
        ajmds.nama_siswa, ajmds.absensi
        FROM adr_jurnal_mengajar ajm JOIN adr_jurnal_mengajar_detail_siswa ajmds
        ON ajm.id = ajmds.id_jurnal
        WHERE ajmds.id_siswa = :id_siswa_ AND DATE(ajm.tanggal_jurnal) BETWEEN :dari_ AND :sampai_
        ORDER BY ajm.tanggal_jurnal ASC`,
        { replacements: { id_siswa_: `${id_siswa}`, dari_: `${dateDari}`, sampai_: `${dateSampai}` }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });
    } else {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70013');
    }
    return res.status(200).json(rsMsg('000000', data));
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/siswa/absensi...', e);
  }
}