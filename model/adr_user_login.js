const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrUserLogin = dbConnection.define('adr_user_login', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  id_account: Sequelize.STRING,
  tipe_account: Sequelize.STRING,
  password: Sequelize.STRING,
  role: Sequelize.STRING,
  email: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_user_login'
});

module.exports = adrUserLogin;