// database.js
const { Sequelize } = require('sequelize');

// SQLite için yeni bir Sequelize örneği oluşturun
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite veritabanı dosyası
});

module.exports = sequelize;
