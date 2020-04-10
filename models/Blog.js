const Sequelize = require('sequelize');
const db = require('../config/database');

const Blog = db.define('blogs', {

    title: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    categoryName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Blog;