const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrClassLevel = dbConnection.define('adr_class_level', {
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
  deskripsi: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_class_level'
});

module.exports = adrClassLevel;