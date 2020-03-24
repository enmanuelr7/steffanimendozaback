const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: 'AKIAJY7FWE6QSYOBCKFA',
    secretAccessKey: '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'
});

var s3 = new AWS.S3();

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})


const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('not vaild file type'), false);
    }
};


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2000000
    },
    fileFilter: fileFilter
});


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
            res.send(blogs[0]);
        }

        res.status(404);
        res.send({ 'Error': `record with id ${id} not existent` });

    } catch (error) {

        res.status(500);
        res.send({ 'Error': error.message });

    }
});

// Create blog
router.post('/', upload.single('image'), async (req, res) => {
    try {

        const blog = {
            categoryId: req.body.categoryId,
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.file.filename
        }

        const filePath = req.file.path;

        //configuring parameters AWS
        var params = {
            Bucket: 'steffanimendoza',
            Body: fs.createReadStream(filePath),
            Key: 'images/' + req.file.filename
        };

        s3.upload(params, function (err, data) {
            //handle error
            if (err) {
                console.log("Error", err);
            }
            //success
            if (data) {
                console.log("Uploaded in:", data.Location);
            }
        });

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


        fs.stat('public/images/' + blogs[0].imageUrl, (err, stats) => {

            if (err) {
                return console.error(err);
            }

            fs.unlink('public/images/' + blogs[0].imageUrl, err => {
                if (err) return console.log(err);
                console.log('file deleted successfully');
            });
        });

        const result = await blogs[0].destroy()

        res.status(200);
        res.send(result)

    } catch (error) {
        res.status(500);
        res.send({ 'Error': error.message });

    }
});



module.exports = router;