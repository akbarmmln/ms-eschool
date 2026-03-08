const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrClassLevelSilabus = dbConnection.define('adr_class_level_silabus', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  id_tingkat_kelas: Sequelize.STRING,
  id_silabus: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_class_level_silabus'
});

module.exports = adrClassLevelSilabus;