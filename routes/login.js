const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { getAccessTokenSecret, getAccessKey } = require('../services/awsService');

const router = Router();
const key = 'login';

const TOKEN_DURATION = 5; // minutes

router.post(
    '/',
    async (req, res) => {
        console.log('\nPOST /login');
        
        const { accessKeyID, secretAccessKey } = req.body;

        await getAccessKey(accessKeyID)
            .then(async accessKey => {
                console.log("===> Access Key exists!")

                // Compare Secret Access Key to Hash in DB
                bcrypt.compare(secretAccessKey, accessKey['Secret Access Key Hash'], async (err, result) => {
                    if (err) {
                        console.log("===> Error in bcrypt.compare! Error =", err);
                        res.status(500).json({ message: `Error in bcrypt.compare! Error: ${err}` } );
                    }
                    else {
                        // Input Secret Access Key MATCHES Hash in DB
                        if (result) {
                            console.log("===> Secret Access Key matches record!");

                            // Generate Access Token
                            await getAccessTokenSecret()
                                .then(accessTokenSecret => {
                                    console.log('===> Creating Access Token...')

                                    const now = new Date();
                                    const expires = new Date(now.getFullYear(), now.getMonth(), now.getDay(), now.getHours(), now.getMinutes() + TOKEN_DURATION, now.getSeconds())

                                    const accessToken = jwt.sign({
                                        accessKeyID: accessKeyID,
                                        user: accessKey['User'],
                                        expires: expires.toUTCString() }, accessTokenSecret);
                                    console.log('===> Access Token Created!')
                                    res.status(200).send({ token: accessToken });
                                })
                                .catch(err => {
                                    console.log('===> Unable to fetch Access Token Secret. Error:', err);
                                    res.status(err.code).json({ message: `Unable to fetch Access Token Secret. Error: ${err}` } );
                                });
                        }

                        // Input Secret Access Key DOES NOT MATCH Hash in DB
                        else {
                            console.log("===> Secret Access Key does not match record!");
                            res.status(400).json({ message: `accessKeyID or secretAccessKey is incorrect` } );
                        }
                    }
                })
            })
            .catch(err => {
                console.log("===> Error Fetching Access Key! Error =", err.message)
                res.status(err.code).json({ message: err.message });
            })
    }
);

module.exports = router;