const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrKotaKab = dbConnection.define('mst_kota_kabupaten', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  id_provinsi: Sequelize.STRING,
  nama: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'mst_kota_kabupaten'
});

module.exports = adrKotaKab;