const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrSessLogin = dbConnection.define('adr_session_login', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  is_deleted: Sequelize.INTEGER,
  account_id: Sequelize.STRING,
  session: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_session_login'
});

module.exports = adrSessLogin;