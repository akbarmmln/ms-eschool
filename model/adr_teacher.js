const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrTeacher = dbConnection.define('adr_teacher', {
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
  tanggal_lahir: Sequelize.DATE,
  alamat: Sequelize.STRING,
  pendidikan: Sequelize.STRING,
  jenis_kelamin: Sequelize.STRING,
  niy: Sequelize.STRING,
  email: Sequelize.STRING,
  nomor_handphone: Sequelize.STRING,
  status: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_teacher'
});

module.exports = adrTeacher;