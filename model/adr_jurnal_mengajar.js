const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrJurnalMengajar = dbConnection.define('adr_jurnal_mengajar', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  tanggal_jurnal: Sequelize.DATE,
  jam_mulai: Sequelize.TIME,
  jam_selesai: Sequelize.TIME,
  materi: Sequelize.STRING,
  refleksi: Sequelize.STRING,
  id_kelas: Sequelize.STRING,
  nama_kelas: Sequelize.STRING,
  id_guru: Sequelize.STRING,
  nama_guru: Sequelize.STRING,
  status_absensi: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_jurnal_mengajar'
});

module.exports = adrJurnalMengajar;