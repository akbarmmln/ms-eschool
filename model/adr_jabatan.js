const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrJabatan = dbConnection.define('adr_jabatan', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  nama: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_jabatan'
});

module.exports = adrJabatan;