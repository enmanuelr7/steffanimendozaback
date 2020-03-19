const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/', async (req, res) => {
    try {
        res.send(await Category.findAll());
        res.status(200);
    } catch (error) {
        res.send({ 'Error': error.message });
        res.status(500);
    }
});

module.exports = router;