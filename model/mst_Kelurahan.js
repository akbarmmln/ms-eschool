const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrKelurahan = dbConnection.define('mst_kelurahan', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  id_kecamatan: Sequelize.STRING,
  nama: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'mst_kelurahan'
});

module.exports = adrKelurahan;