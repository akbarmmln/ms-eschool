const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;
const adrSilabus = require('./adr_silabus');

const adrSilabusItems = dbConnection.define('adr_silabus_items', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  kode_silabus: Sequelize.STRING,
  nama: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_silabus_items'
});

module.exports = adrSilabusItems;