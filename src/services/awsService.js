const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1',
});

var dynamodb = new AWS.DynamoDB();
var ssm = new AWS.SSM();

const getAccessTokenSecret = async () => {
    console.log('===> Fetching Access Token Secret...');

    let accessTokenSecret = undefined;

    var params = { Name: '/CougarCS/API/AccessTokenSecret', WithDecryption: true };
    let request = ssm.getParameter(params);

    await request.promise().then(
        async data => {                
            console.log('===> Access Token Secret successfully fetched!');
            accessTokenSecret = data.Parameter.Value;
        },
        async err => {
            console.log('===> Fetch Failed!');
            console.log(err, err.stack); // an error occurred
            console.log('===> Internal Error -- AWS SSM getParameter Failed!')
            throw { 'code': 500, 'message': `AWS SSM getParameter Failed! Error = ${err}` };
        }
    );

    return accessTokenSecret;
}

const getAccessKey = async accessKeyID => {
    console.log('===> Fetching Access Key...');

    let accessKey = undefined;

    const params = { TableName: 'CougarCS-API-Access-Keys', Key: { 'Access Key ID': { S: accessKeyID } } };
    let request = dynamodb.getItem(params);
    await request.promise().then(
        async data => {                
            if ( !Object.keys(data).length ) {
                console.log(`===> Access Key w/ ID ${accessKeyID} does not exist!`)
                throw { 'code': 400, 'message': `Access Key w/ ID ${accessKeyID} does not exist!`};
            } else {
                let item = data.Item;
                accessKey = AWS.DynamoDB.Converter.unmarshall(item);
            }
        },
        async err => {
            console.log(`===> Internal Error -- AWS DynamoDB getItem Failed! Error = ${err}`)
            throw { 'code': 500, 'message': `AWS DynamoDB getItem Failed! Error = ${err}` };
        }
    );

    if (!accessKey) throw { 'code': 400, 'message': `Access Key w/ ID ${accessKeyID} does not exist!`};
    return accessKey;
}

module.exports = { AWS, getAccessTokenSecret, getAccessKey }