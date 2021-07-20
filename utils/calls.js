const jwt = require('jsonwebtoken');

const { getAccessTokenSecret } = require('../services/awsService');

const authenticateJWT = async (req, res, next) => {
    console.log('\nAUTH REQUIRED :: Validating token...')

    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        await getAccessTokenSecret()
        .then(accessTokenSecret => {
            jwt.verify(token, accessTokenSecret, (err, accessKey) => {
                if (err) {
                    console.log('Failed to verify token.');
                    return res.status(406).json({ message: 'Failed to verify token.' });
                }

                if (!('expires' in accessKey)) {
                    console.log('Token does not include "expires" field. Out of date.');
                    return res.status(401).json({ message: 'Token is out of date. Generate a new one.' });
                }

                const now = new Date();
                const expires = new Date(accessKey.expires);

                if (now < expires) {
                    console.log('Token is expired.')
                    return res.status(401).json({ message: 'Token is expired.' });
                }

                req.accessKey = accessKey;
                console.log("===> Token validated! User =", accessKey.user)
                next();
            });
        })
        .catch(err => {
            console.log('===> Unable to fetch access token secret.');
            console.log('===> Error =', err);
            res.status(500).json({ message: 'Unable to fetch access token secret.' });
        });

    } else {
        res.status(401).json({ 'message': 'Authorization required.' });
    }
};

module.exports = { authenticateJWT };