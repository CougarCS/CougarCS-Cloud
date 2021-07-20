const app = require('./app');
const { PORT, IN_LAMBDA } = require('./utils/config');

const APP_PORT = PORT;

if (IN_LAMBDA) {
    const serverlessExpress = require('aws-serverless-express');
    const server = serverlessExpress.createServer(app);
    module.exports.handler = (event, context) => serverlessExpress.proxy(server, event, context);
} else {
    app.listen(APP_PORT, () => {
        console.log('\n-- CougarCS API is NOT running on AWS Lambda');
        console.log(`-- CougarCS API is listening at http://localhost:${APP_PORT}`);
    });
}