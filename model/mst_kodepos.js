const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrKodePos = dbConnection.define('mst_kodepos', {
  kode_kelurahan: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  kode_pos: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'mst_kodepos'
});

module.exports = adrKodePos;