const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrAuthOtp = dbConnection.define('adr_auth_otp', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  session: Sequelize.STRING,
  code: Sequelize.STRING,
  counter: Sequelize.STRING,
  valid_until_dt: Sequelize.DATE,
  next_sent: Sequelize.DATE,
  otp_validate: Sequelize.INTEGER,
  jwt: Sequelize.STRING,
  email: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_auth_otp'
});

module.exports = adrAuthOtp;