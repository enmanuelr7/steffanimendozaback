const Sequelize = require('sequelize');
const db = require('../config/database');

const Category = db.define('categories', {
    name: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Category; 