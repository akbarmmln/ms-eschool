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
const adrClassRoom = require('../../../model/adr_class_room');
const adrTeacher = require('../../../model/adr_teacher');
const adrClassLevelSilabus = require('../../../model/adr_class_level_silabus');
const adrJurnalMengajarDetailSiswa = require('../../../model/adr_jurnal_mengajar_detail_siswa');
const adrJurnalMengajarDetailSilabus = require('../../../model/adr_jurnal_mengajar_detail_silabus');
const adrSilabus = require('../../../model/adr_silabus');

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
    const guru = req.body.guru;

    const dataKelas = await adrClassRoom.findOne({
      raw: true,
      where: {
        id: kelas,
        is_deleted: 0
      }
    })
    if (!dataKelas || !dataKelas?.id_tingkat_kelas) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70010');
    }

    const idTingkatKelas = dataKelas?.id_tingkat_kelas;
    const dataGuru = await adrTeacher.findOne({
      raw: true,
      where: {
        id: guru,
        is_deleted: 0
      }
    })
    if (!dataGuru) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70010');
    }

    const dataSiswa = await adrSiswa.findAll({
      raw: true,
      where: {
        id_kelas: kelas,
        is_deleted: 0
      }
    })
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
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70010');
    }

    const levelSilabus = await adrClassLevelSilabus.findAll({
      include: [{
        model: adrSilabus,
        required: true
      }],
      where: {
        id_tingkat_kelas: idTingkatKelas,
        is_deleted: 0,
      }
    })
    if (levelSilabus.length == 0) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70010');
    }

    const pushSilabusItems = []
    if (levelSilabus.length > 0) {
      for (let i = 0; i < levelSilabus.length; i++) {
        const silabus = await sequelize.query(`SELECT adr_silabus.id, adr_silabus.nama, 
        adr_silabus_items.id as item_id, adr_silabus_items.nama as nama_item
        FROM adr_silabus LEFT JOIN adr_silabus_items
        ON adr_silabus.id = adr_silabus_items.kode_silabus
        where adr_silabus.id = :id_ AND adr_silabus.is_deleted = '0'`,
          { replacements: { id_: `${levelSilabus[i].id_silabus}` }, type: sequelize.QueryTypes.SELECT },
          {
            raw: true
          });

        if (silabus.length) {
          const result = {
            id: silabus[0]?.id,
            title: silabus[0]?.nama,
            items: silabus
              .filter(item => item.nama_item !== null)
              .map(item => ({
                id: item?.item_id,
                nama_item: item?.nama_item
              }))
          };
          pushSilabusItems.push(result)
        }
      }
    }

    if (pushSilabusItems.length == 0) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70010');
    }

    const queryForInsert = [];
    result.forEach(s => {
      pushSilabusItems.forEach(subject => {
        subject.items.forEach(item => {
          queryForInsert.push({
            id: uuidv7(),
            created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            created_by: req.id,
            is_deleted: 0,
            id_jurnal: id_jurnal,
            id_silabus: subject.id,
            id_detail_diajar: s.id,
            title_silabus: subject.title,
            item_silabus: item.nama_item,
            nilai: null,
            keterangan: null
          });
        })
      })
    })

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
      id_guru: dataGuru?.id,
      nama_guru: dataGuru?.nama,
      initiate_nilai: 0
    }, { transaction })

    await adrJurnalMengajarDetailSiswa.bulkCreate(result, {
      transaction
    });

    await adrJurnalMengajarDetailSilabus.bulkCreate(queryForInsert, {
      transaction
    })

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
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70001');
    }

    const data = await adrJurnalMengajar.findOne({
      raw: true,
      where: {
        id: id,
        is_deleted: 0
      }
    })
    if (!data) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70008');
    }

    const detail = await adrJurnalMengajarDetailSiswa.findAll({
      raw: true,
      where: {
        id_jurnal: data?.id
      }
    })

    const hasil = {
      jurnal: data,
      siswa: detail
    }

    return res.status(200).json(rsMsg('000000', hasil))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/jurnal/detail...', e);
  }
}

exports.updateAbsensi = async function (req, res) {
  try {
    const id = req.body.id;
    const absensi = req.body.absensi;
    if (typeof absensi !== 'object') {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70011');
    }
    if (absensi.length == 0) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70012');
    }

    await Promise.all(
      absensi.map(item => {
        return adrJurnalMengajarDetailSiswa.update(
          { absensi: item.status },
          {
            where: {
              id: item.id_detail_diajar
            }
          }
        );
      })
    );

    await adrJurnalMengajar.update({
      initiate_nilai: 1
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/update-absensi...', e);
  }
}

exports.inisiasiPenilaian = async function (req, res) {
  try {
    const id_jurnal = req.body.id_jurnal;
    const id_diajar = req.body.id_diajar;

    const detailSilabus = await adrJurnalMengajarDetailSilabus.findAll({
      raw: true,
      where: {
        id_jurnal: id_jurnal,
        id_detail_diajar: id_diajar,
        is_deleted: 0
      }
    })

    const grouped = Object.values(
      detailSilabus.reduce((a, { id, id_silabus, title_silabus, item_silabus, nilai, keterangan }) => {
        (a[id_silabus] ??= { id: id_silabus, title: title_silabus, items: [] })
          .items.push({ id: id, nama_item: item_silabus, nilai: nilai, keterangan: keterangan });
        return a;
      }, {})
    );

    return res.status(200).json(rsMsg('000000', grouped))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/inisiasi-penilaian...', e);
  }
}