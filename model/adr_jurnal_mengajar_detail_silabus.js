const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrJurnalMengajarDetailSilabus = dbConnection.define('adr_jurnal_mengajar_detail_silabus', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  id_jurnal: Sequelize.STRING,
  id_detail_diajar: Sequelize.STRING,
  id_silabus: Sequelize.STRING,
  title_silabus: Sequelize.STRING,
  item_silabus: Sequelize.STRING,
  nilai: Sequelize.STRING,
  keterangan: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_jurnal_mengajar_detail_silabus'
});

module.exports = adrJurnalMengajarDetailSilabus;