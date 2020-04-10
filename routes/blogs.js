const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const checkAuth = require('../middleware/check-auth');
if (process.env.NODE_ENV !== 'production') require('dotenv').config()


AWS.config.update({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
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
router.get('/:title', async (req, res) => {
    try {

        const title = req.params.title;

        const blogs = await Blog.findAll({
            where: {
                title: title
            }
        });

        if (blogs.length > 0) {
            return res.status(200).send(blogs[0]);
        }

        res.status(404).send({ 'Error': `record with title ${title} not existent` });

    } catch (error) {

        res.status(500).send({ 'Error': error.message });

    }
});

// Get blogs by category
router.get('/byCategory/:categoryName', async (req, res) => {
    try {

        const categoryName = req.params.categoryName;
        const blogs = await Blog.findAll({
            where: {
                categoryName: categoryName
            }
        });

        res.status(200).send(blogs);


    } catch (error) {

        res.status(500);
        res.send({ 'Error': error.message });

    }
});

// Create blog
router.post('/', checkAuth, upload.single('image'), async (req, res) => {
    try {

        const blog = {
            categoryName: req.body.categoryName,
            title: req.body.title,
            content: req.body.content,
            imageUrl: 'https://steffanimendoza.s3-sa-east-1.amazonaws.com/images/' + req.file.filename
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
                console.log("image uploaded in:", data.Location);
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
router.put('/:title', checkAuth, upload.single('image'), async (req, res) => {
    try {

        const title = req.params.title;
        const blogs = await Blog.findAll({
            where: {
                title: title
            }
        });

        if (blogs.length == 0) {
            res.status(404);
            res.send({ 'Error': `record with title ${title} not existent` });
        }

        let imageChange;

        if (req.file) {
            imageChange = true
        } else {
            imageChange = false;
        }

        const updatedBlog = {
            categoryName: req.body.categoryName,
            content: req.body.content,
            imageUrl: imageChange ? 'https://steffanimendoza.s3-sa-east-1.amazonaws.com/images/' + req.file.filename : blogs[0].imageUrl
        }

        if (imageChange) {

            const filePath = req.file.path;

            //configuring parameters AWS
            let params = {
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
                    console.log("image uploaded in:", data.Location);
                }
            });

            //Delete old blog image
            params = { Bucket: 'steffanimendoza', Key: 'images/' + blogs[0].imageUrl.slice(58) };

            s3.deleteObject(params, function (err, data) {
                if (err) console.log(err, err.stack);
                if (data) console.log('image deleted');
            });

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
router.delete('/:title', checkAuth, async (req, res) => {
    try {

        const title = req.params.title;
        const blogs = await Blog.findAll({
            where: {
                title: title
            }
        });

        if (blogs.length == 0) {
            res.status(404);
            res.send({ 'Error': `record with title ${title} not existent` });
        }

        var params = { Bucket: 'steffanimendoza', Key: 'images/' + blogs[0].imageUrl.slice(58) };

        s3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack);
            if (data) console.log('image deleted');
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