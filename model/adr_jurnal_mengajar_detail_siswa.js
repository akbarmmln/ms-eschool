const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrJurnalMengajarDetailSiswa = dbConnection.define('adr_jurnal_mengajar_detail_siswa', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  id_jurnal: Sequelize.STRING,
  id_siswa: Sequelize.STRING,
  nama_siswa: Sequelize.STRING,
  absensi: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_jurnal_mengajar_detail_siswa'
});

module.exports = adrJurnalMengajarDetailSiswa;