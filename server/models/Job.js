const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  salary: {
    type: DataTypes.STRING
  },
  result: {
    type: DataTypes.STRING
  },
  score: {
    type: DataTypes.INTEGER
  },
  flags: {
    type: DataTypes.TEXT
  }
});

module.exports = Job;