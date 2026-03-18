const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrSettings = dbConnection.define('adr_settings', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  nama_yayasan: Sequelize.STRING,
  nomor_telepon: Sequelize.STRING,
  alamat_email: Sequelize.STRING,
  website: Sequelize.STRING,
  alamat: Sequelize.STRING,
  negara: Sequelize.STRING,
  provinsi: Sequelize.STRING,
  kota_kab: Sequelize.STRING,
  kode_pos: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_settings'
});

module.exports = adrSettings;