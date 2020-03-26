const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    try {
        if (req.body.authorizationKey === process.env.JWT_KEY) {

            const username = req.body.username
            const users = await User.findAll({
                where: {
                    username: username
                }
            });

            if (users.length > 0) {
                return res.status(200).send({
                    message: `username ${username} is already taken. try another`
                })
            }

            bcrypt.hash(req.body.password, 10, async (err, hash) => {
                if (err) {
                    return res.status(500).send({
                        error: err
                    });
                }

                const user = {
                    username: username,
                    password: hash
                }

                const result = await User.create(user);
                res.status(201).send({
                    created: result
                })
            })

        } else {
            res.status(401).send('Unauthorized');
        }

    } catch (err) {
        console.log(err);
        res.send({ 'Error': err.message });
        res.status(500);
    }
});

router.post('/login', async (req, res) => {
    try {
        const username = req.body.username
        const users = await User.findAll({
            where: {
                username: username
            }
        });

        if (users.length === 0) {
            return res.status(401).send({
                message: 'invalid username or password'
            })
        }

        const user = users[0];
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            const token = jwt.sign({
                username: user.username,
                id: user.id
            }, process.env.JWT_KEY, {
                expiresIn: '2h'
            })
            return res.status(200).send({
                token: token
            });
        } else {
            return res.status(401).send({
                message: 'invalid username or password'
            });
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'auth failed, try again later' });
    }
});

module.exports = router;