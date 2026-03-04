const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrParents = dbConnection.define('adr_parents', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  nama_ayah: Sequelize.STRING,
  nama_ibu: Sequelize.STRING,
  email: Sequelize.DATE,
  pekerjaan_ayah: Sequelize.STRING,
  pekerjaan_ibu: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_parents'
});

module.exports = adrParents;