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
const adrJurnalMengajar = require('../../../model/adr_jurnal_mengajar');
const adrSiswa = require('../../../model/adr_siswa');
const adrJurnalMengajarDetailSiswa = require('../../../model/adr_jurnal_mengajar_detail_siswa');
const adrClassRoom = require('../../../model/adr_class_room');

exports.createJurnalMengajar = async function (req, res) {
  const transaction = await sequelize.transaction();
  try {
    const id_jurnal = uuidv7();
    const tanggal = req.body.tanggal;
    const mulai = req.body.mulai;
    const selesai = req.body.selesai;
    const materi = req.body.materi;
    const refleksi = req.body.refleksi;
    const kelas = req.body.kelas;

    const dataSiswa = await adrSiswa.findAll({
      raw: true,
      where: {
        id_kelas: kelas,
        is_deleted: 0
      }
    })
    const dataKelas = await adrClassRoom.findOne({
      raw: true,
      where: {
        id: kelas,
        is_deleted: 0
      }
    })
    if (!dataKelas) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70010');
    }

    const result = dataSiswa.map(item => ({
      id: uuidv7(),
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      is_deleted: 0,
      id_jurnal: id_jurnal,
      id_siswa: item.id,
      nama_siswa: item.nama,
      absensi: null
    }));

    if (result.length == 0) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70010');
    }

    await adrJurnalMengajar.create({
      id: id_jurnal,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: req.id,
      is_deleted: 0,
      tanggal_jurnal: moment(tanggal, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      jam_mulai: mulai,
      jam_selesai: selesai,
      materi: materi,
      refleksi: refleksi,
      id_kelas: dataKelas?.id,
      nama_kelas: dataKelas?.nama_kelas,
      status_absensi: 0
    }, {transaction})

    await adrJurnalMengajarDetailSiswa.bulkCreate(result, {
      transaction
    });

    await transaction.commit();
    return res.status(200).json(rsMsg('000000', {
      id: id_jurnal
    }))
  } catch (e) {
    if (transaction) await transaction.rollback();
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/create...', e);
  }
}

exports.getDetailJurnalMengajar = async function (req, res) {
  try {
    const id = req.params.id;
    
    if (formatter.isEmpty(id)) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70001');
    }

    const data = await adrJurnalMengajar.findOne({
      raw: true,
      where: {
        id: id,
        is_deleted: 0
      }
    })
    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.UNAUTHORIZED, '70008');
    }
    const detail = await adrJurnalMengajarDetailSiswa.findAll({
      raw: true,
      where: {
        id_jurnal: data?.id
      }
    })

    const hasil = {
      jurnal: data,
      jurnal_details: detail
    }
    
    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/jurnal/detail...', e);
  }
}