const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrKecamatan = dbConnection.define('mst_kecamatan', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  id_kabupaten: Sequelize.STRING,
  nama: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'mst_kecamatan'
});

module.exports = adrKecamatan;