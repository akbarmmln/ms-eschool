const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;
const adrSilabusItems = require('./adr_silabus_items');

const adrSilabus = dbConnection.define('adr_silabus', {
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
  tableName: 'adr_silabus'
});

adrSilabus.hasMany(adrSilabusItems, {
  as: 'items',
  foreignKey: 'kode_silabus',
  sourceKey: 'id'
});


module.exports = adrSilabus;