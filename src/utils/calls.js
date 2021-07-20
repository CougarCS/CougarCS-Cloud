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
                if (err) return res.sendStatus(403);
                req.accessKey = accessKey;
                console.log("===> Token validated! User =", accessKey.user)
                next();
            });
        })
        .catch(err => {
            console.log('===> Unable to fetch access token secret.');
            console.log('===> Error =', err);
            res.status(500).sendFile('/templates/500.html');
        });

    } else {
        res.sendStatus(401);
    }
};

module.exports = { authenticateJWT };