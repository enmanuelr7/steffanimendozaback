const Sequelize = require('sequelize');

module.exports = new Sequelize('vasa', 'root', 'qwerty123', {
    host: 'localhost',
    dialect: 'mysql'
});