const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrJurnalImgAsses = dbConnection.define('adr_jurnal_images_assesment', {
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
  id_siswa: Sequelize.STRING,
  url_image: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_jurnal_images_assesment'
});

module.exports = adrJurnalImgAsses;