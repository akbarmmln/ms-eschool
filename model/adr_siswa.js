const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrSiswa = dbConnection.define('adr_siswa', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  nama: Sequelize.STRING,
  jenis_kelamin: Sequelize.STRING,
  tanggal_lahir: Sequelize.DATE,
  nik: Sequelize.STRING,
  alamat: Sequelize.STRING,
  rt: Sequelize.STRING,
  rw: Sequelize.STRING,
  kelurahan: Sequelize.STRING,
  kecamatan: Sequelize.STRING,
  id_kelas: Sequelize.STRING,
  id_parent: Sequelize.STRING,
  image: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_siswa'
});

module.exports = adrSiswa;