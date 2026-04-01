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
const templateHtml = require('./template')

exports.getListJurnal = async function (req, res) {
  try {
    let count, data;
    const id_guru = req.id;
    const dari = req.params.dari
    const sampai = req.params.sampai;
    const page = parseInt(req.params.page);
    const limit = 9;
    const offset = limit * (page - 1);

    if (dari && sampai) {
      const dateDari = moment(dari, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const dateSampai = moment(sampai, 'DD-MM-YYYY').format('YYYY-MM-DD');

      if (dateDari > dateSampai) {
        throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70014');
      }

      count = await sequelize.query(`SELECT COUNT(*) as count FROM adr_jurnal_mengajar
        WHERE id_guru = :id_guru_ AND DATE(tanggal_jurnal) BETWEEN :dari_ AND :sampai_`,
        { replacements: { id_guru_: id_guru, dari_: `${dateDari}`, sampai_: `${dateSampai}` }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });

      data = await sequelize.query(`SELECT jm.id, jm.tanggal_jurnal, jm.jam_mulai, jm.jam_selesai, jm.materi,
        jm.refleksi, jm.id_kelas, jm.nama_kelas, jm.id_guru, jm.nama_guru, jm.initiate_nilai,
        d.id as id_diajar, d.nama_siswa, d.absensi
        FROM (SELECT * FROM adr_jurnal_mengajar WHERE id_guru = :id_guru_ 
        AND DATE(tanggal_jurnal) BETWEEN :dari_ AND :sampai_ LIMIT ${offset}, ${limit}) jm
        LEFT JOIN adr_jurnal_mengajar_detail_siswa d ON jm.id = d.id_jurnal`,
        { replacements: { id_guru_: id_guru, dari_: `${dateDari}`, sampai_: `${dateSampai}` }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });
    } else {
      count = await sequelize.query(`SELECT COUNT(*) as count FROM adr_jurnal_mengajar
        WHERE id_guru = :id_guru_`,
        { replacements: { id_guru_: id_guru }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });

      data = await sequelize.query(`SELECT jm.id, jm.tanggal_jurnal, jm.jam_mulai, jm.jam_selesai, jm.materi,
        jm.refleksi, jm.id_kelas, jm.nama_kelas, jm.id_guru, jm.nama_guru, jm.initiate_nilai,
        d.id as id_diajar, d.nama_siswa, d.absensi
        FROM (SELECT * FROM adr_jurnal_mengajar WHERE id_guru = :id_guru_ LIMIT ${offset}, ${limit} ) jm
        LEFT JOIN adr_jurnal_mengajar_detail_siswa d ON jm.id = d.id_jurnal
        ORDER BY jm.tanggal_jurnal ASC`,
        { replacements: { id_guru_: id_guru }, type: sequelize.QueryTypes.SELECT },
        {
          raw: true
        });
    }

    if (data.length > 0) {
      const grouped = Object.values(
        data.reduce((acc, row) => {

          if (!acc[row.id]) {
            acc[row.id] = {
              id: row.id,
              tanggal_jurnal: row.tanggal_jurnal,
              jam_mulai: row.jam_mulai,
              jam_selesai: row.jam_selesai,
              materi: row.materi,
              refleksi: row.refleksi,
              id_kelas: row.id_kelas,
              nama_kelas: row.nama_kelas,
              id_guru: row.id_guru,
              nama_guru: row.nama_guru,
              initiate_nilai: row.initiate_nilai,
              detail_siswa: []
            };
          }

          acc[row.id].detail_siswa.push({
            id_diajar: row.id_diajar,
            nama_siswa: row.nama_siswa,
            absensi: row.absensi
          });

          return acc;

        }, {})
      );

      const newRs = {
        rows: grouped,
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
    return utils.returnErrorFunction(res, 'error GET /api/v1/jurnal/list...', e);
  }
}

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

exports.createNewJurnalMengajar = async function (req, res) {
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
      initiate_absensi: 0,
      initiate_nilai: 0
    }, { transaction })

    await adrJurnalMengajarDetailSiswa.bulkCreate(result, {
      transaction
    });

    await transaction.commit();
    return res.status(200).json(rsMsg('000000', {
      id: id_jurnal
    }))
  } catch (e) {
    if (transaction) await transaction.rollback();
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/create-new...', e);
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
      initiate_absensi: 1
    }, {
      where: {
        id: id
      }
    })
    return res.status(200).json(rsMsg('000000', data))
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

exports.updatePenilaian = async function (req, res) {
  try {
    const data = req.body.data;
    if (formatter.isEmpty(data) || typeof data !== 'object') {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70011');
    }

    await Promise.all(
      data.map(item =>
        adrJurnalMengajarDetailSilabus.update(
          {
            nilai: item.status,
            keterangan: item.keterangan
          },
          {
            where: { id: item.id_mengajar }
          }
        )
      )
    );

    return res.status(200).json(rsMsg('000000', {}))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/update-penilaian...', e);
  }
}

exports.submitItemPenilaian = async function (req, res) {
  const transaction = await sequelize.transaction();
  try {
    const id_jurnal = req.body.id_jurnal;
    const id_diajar = req.body.id_diajar;
    const judul = req.body.judul;
    const item_penilaian = req.body.item_penilaian;

    const insertData = generatePenilaian(id_jurnal, id_diajar, judul, item_penilaian, req.id);
    await adrJurnalMengajarDetailSilabus.bulkCreate(insertData, { transaction })
    await adrJurnalMengajar.update({
      initiate_nilai: 1
    }, {
      where: {
        id: id_jurnal
      },
      transaction
    })

    await transaction.commit();
    return res.status(200).json(rsMsg('000000', insertData))
  } catch (e) {
    if (transaction) await transaction.rollback();
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/submit-item-penilaian...', e);
  }
}

exports.downloadSinglePenilaianHarian = async function (req, res) {
  try {
    const id_jurnal = req.body.id_jurnal;
    const id_detail_diajar = req.body.id_detail_diajar;
    const nama_siswa = req.body.nama_siswa;

    const hasil = [{
      tanggal: null,
      niy_guru: null,
      nama_guru: null,
      nama_siswa: nama_siswa,
      niy_principal: null,
      nama_principal: null,
      materi: null,
      refleksi: null,
      items: null
    }];

    const data = await adrJurnalMengajar.findOne({
      raw: true,
      where: {
        id: id_jurnal
      }
    })
    const dataPengajar = await adrTeacher.findOne({
      raw: true,
      where: {
        id: data.id_guru
      }
    })
    const dataPrincipal = await adrTeacher.findOne({
      raw: true,
      where : {
        jabatan: 'principal',
        is_deleted: 0
      }
    })
    hasil[0].niy_guru = dataPengajar?.niy ?? '-'
    hasil[0].nama_guru = dataPengajar?.nama ?? ''
    hasil[0].niy_principal = dataPrincipal?.niy ?? '-'
    hasil[0].nama_principal = dataPrincipal?.nama ?? ''

    const items = await adrJurnalMengajarDetailSilabus.findAll({
      raw: true,
      attributes: ['item_silabus', 'nilai', 'keterangan'],
      where: {
        id_jurnal: id_jurnal,
        id_detail_diajar: id_detail_diajar,
        is_deleted: 0
      }
    })

    hasil[0].tanggal = data.tanggal_jurnal;
    hasil[0].materi = data.materi;
    hasil[0].refleksi = data.refleksi;
    hasil[0].items = items;

    const htmlRender = await templateHtml.htmlSinglePenilaianHarian(hasil)
    const pdf = await utils.pdfPupeeter(htmlRender);

    return res.status(200).json(rsMsg('000000', pdf))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/download-single-penilaian-harian...', e);
  }
}

exports.downloadBulkPenilaianHarian = async function (req, res) {
  try {
    const id_jurnal = req.body.id_jurnal;
    const dataJurnal = await adrJurnalMengajar.findOne({
      raw: true,
      where: {
        id: id_jurnal
      }
    })
    const jurnalDetail = await adrJurnalMengajarDetailSiswa.findAll({
      raw: true,
      where: {
        id_jurnal: dataJurnal.id
      }
    })
    const dataGuru = await adrTeacher.findOne({
      raw: true,
      where: {
        id: dataJurnal.id_guru
      }
    })
    const dataPrincipal = await adrTeacher.findOne({
      raw: true,
      where : {
        jabatan: 'principal',
        is_deleted: 0
      }
    })

    let hasil = [];
    for (let i=0; i<jurnalDetail.length; i++) {
      const id_diajar = jurnalDetail[i].id
      const data = {
        tanggal: dataJurnal.tanggal_jurnal,
        niy_guru: dataGuru.niy ?? '-',
        nama_guru: dataGuru.nama,
        nama_siswa: jurnalDetail[i].nama_siswa,
        niy_principal: dataPrincipal.niy ?? '-',
        nama_principal: dataPrincipal.nama,
        materi: dataJurnal.materi,
        refleksi: dataJurnal.refleksi,
        items: null
      }
      const items = await adrJurnalMengajarDetailSilabus.findAll({
        raw: true,
        attributes: ['item_silabus', 'nilai', 'keterangan'],
        where: {
          id_jurnal: dataJurnal.id,
          id_detail_diajar: id_diajar,
          is_deleted: 0
        }
      })
      data.items = items
      hasil.push(data)
    }

    const htmlRender = await templateHtml.htmlSinglePenilaianHarian(hasil)
    
    const pdf = await utils.pdfPupeeter(htmlRender);
    // const pdf = await utils.pdfWkhtml(htmlRender);
    const buf = Buffer.from(pdf, 'base64');
    const base64 = buf.toString("base64")

    return res.status(200).json(rsMsg('000000', base64))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/jurnal/download-bulk-penilaian-harian...', e);
  }
}

function generatePenilaian(id_jurnal, id_diajar, judul, item_penilaian, account_id) {
  const rows = [];
  const id_silabus = uuidv7();
  for (const idDiajar of id_diajar) {
    for (const itemPenilaian of item_penilaian) {
      rows.push({
        id: uuidv7(),
        created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        created_by: account_id,
        is_deleted: 0,
        id_jurnal: id_jurnal,
        id_detail_diajar: idDiajar,
        id_silabus: id_silabus,
        title_silabus: judul,
        item_silabus: itemPenilaian,
        nilai: null,
        keterangan: null,
      });
    }
  }
  return rows;
}