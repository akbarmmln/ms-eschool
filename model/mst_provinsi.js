const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrProvinsi = dbConnection.define('mst_provinsi', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  nama: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'mst_provinsi'
});

module.exports = adrProvinsi;