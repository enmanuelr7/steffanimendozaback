const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');


// Get all blogs
router.get('/', async (req, res) => {
    try {
        res.status(200);
        res.send(await Blog.findAll());
    } catch (error) {
        res.status(500);
        res.send({ 'Error': error.message });
    }
});

// Get single blog
router.get('/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const blogs = await Blog.findAll({
            where: {
                id: id
            }
        });

        if (blogs.length > 0) {
            res.status(200);
            res.send(blogs);
        }

        res.status(404);
        res.send({ 'Error': `record with id ${id} not existent` });

    } catch (error) {

        res.status(500);
        res.send({ 'Error': error.message });

    }
});

// Create blog
router.post('/', async (req, res) => {
    try {

        const blog = {
            categoryId: req.body.categoryId,
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.body.imageUrl
        }

        const result = await Blog.create(blog)
        res.status(201);
        res.send(result)

    } catch (error) {
        res.status(500);
        res.send({ 'Error': error.message });

    }
});

// Update blog
router.put('/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const blogs = await Blog.findAll({
            where: {
                id: id
            }
        });

        if (blogs.length == 0) {
            res.status(404);
            res.send({ 'Error': `record with id ${id} not existent` });
        }

        const updatedBlog = {
            categoryId: req.body.categoryId,
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.body.imageUrl
        }

        const result = await blogs[0].update(updatedBlog)

        res.status(200);
        res.send(result)

    } catch (error) {
        res.status(500);
        res.send({ 'Error': error.message });

    }
});

// Delete blog
router.delete('/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const blogs = await Blog.findAll({
            where: {
                id: id
            }
        });

        if (blogs.length == 0) {
            res.status(404);
            res.send({ 'Error': `record with id ${id} not existent` });
        }

        const result = await blogs[0].destroy()

        res.status(200);
        res.send(result)

    } catch (error) {
        res.status(500);
        res.send({ 'Error': error.message });

    }
});



module.exports = router;