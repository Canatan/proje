// models/TopologyItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const TopologyItem = sequelize.define('TopologyItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cell: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = TopologyItem;
