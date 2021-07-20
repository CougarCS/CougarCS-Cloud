const { Router } = require('express');

const { getAccessTokenSecret, getAccessKey } = require('../services/awsService');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = Router();
const key = 'login';

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
                        // res.sendStatus(500).sendFile(__dirname + '/templates/500.html');
                    }
                    else {
                        // Input Secret Access Key MATCHES Hash in DB
                        if (result) {
                            console.log("===> Secret Access Key matches record!");

                            // Generate Access Token
                            await getAccessTokenSecret()
                                .then(accessTokenSecret => {
                                    console.log('===> Creating Access Token...')
                                    const accessToken = jwt.sign({ accessKeyID: accessKeyID, user: accessKey['User'] }, accessTokenSecret);
                                    console.log('===> Access Token Created!')
                                    res.status(200).send({ token: accessToken });
                                })
                                .catch(err => {
                                    console.log('===> Unable to fetch Access Token Secret. Error:', err);
                                    res.status(500).json({ message: `Unable to fetch Access Token Secret. Error: ${err}` } );
                                    // res.sendStatus(500).sendFile(__dirname + '/templates/500.html');
                                });
                        }

                        // Input Secret Access Key DOES NOT MATCH Hash in DB
                        else {
                            console.log("===> Secret Access Key does not match record!");
                            res.status(400).json({ message: `accessKeyID or secretAccessKey is incorrect` } );
                            // res.status(400).sendFile(__dirname + '/templates/400.html');
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