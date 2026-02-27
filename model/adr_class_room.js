const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrClassRoom = dbConnection.define('adr_class_room', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  nama_kelas: Sequelize.STRING,
  id_wakil_wali_kelas: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_class_room'
});

module.exports = adrClassRoom;