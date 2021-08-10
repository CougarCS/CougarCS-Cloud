const { AWS } = require('./awsService');
const { Contact } = require('../utils/contactData');
const { Validation } = require('../utils/validation');

let dynamodb = new AWS.DynamoDB();

const getContact = async ({ psid, email }) => {
    if (psid) psid = psid.trim();
    if (email) email = email.trim();

    if (!psid && !email) throw { 'code': 400, 'message': 'Invalid invocation of getContact: PSID and Email are Empty!'};

    let contact = null;

    if (psid) {
        if ( !Validation.PSID.test(psid) ) throw { 'code': 400, 'message': 'Invalid invocation of getContact: PSID is invalid!'};

        const params = { TableName: 'CougarCS-Contacts', Key: { 'PSID': { 'S': psid } } };

        let request = dynamodb.getItem(params);
        await request.promise().then(
            async data => {                
                // console.log('===> AWS DynamoDB getItem Data =', data)
                if ( !Object.keys(data).length ) {
                    console.log(`===> Contact w/ PSID ${psid} does not exist!`)
                    throw { 'code': 404, 'message': `Contact w/ PSID ${psid} does not exist!`};
                } else {
                    let item = data.Item;
                    contact = getContactFromItem(AWS.DynamoDB.Converter.unmarshall(item));
                }
            },
            async err => {
                console.log(`===> Internal Error -- AWS DynamoDB getItem Failed! Error = ${err}`)
                throw { 'code': 500, 'message': `Internal Error -- AWS DynamoDB getItem Failed! Error = ${err}` };
            }
        );
    }

    else if (email) {
        if ( !Validation.EMAIL.test(email) ) throw { 'code': 400, 'message': 'Invalid invocation of getContact: Email is invalid!'};

        const params = {
            TableName: 'CougarCS-Contacts',
            FilterExpression: 'Email = :email',
            ExpressionAttributeValues: { ':email': { S: email } }
        };

        let request = dynamodb.scan(params);
        await request.promise().then(
            async data => {
                // console.log('===> AWS DynamoDB Scan Data =', data)
                if ( !data.Items.length ) {
                    console.log(`===> Contact w/ Email ${email} does not exist!`)
                    throw { 'code': 404, 'message': `Contact w/ Email ${email} does not exist!`};
                } else {
                    let item = data.Items[0];
                    contact = getContactFromItem(AWS.DynamoDB.Converter.unmarshall(item));
                }
            },
            async err => {
                console.log(`===> Internal Error -- AWS DynamoDB scan Failed! Error = ${err}`)
                throw { 'code': 500, 'message': `Internal Error -- AWS DynamoDB scan Failed! Error = ${err}` };
            }
        );
    }

    return contact;
}

const postContact = async ({ psid, email, phoneNumber, firstName, lastName, shirtSize, transaction, membershipStart, membershipEnd }) => {
    if ( !Validation.PSID.test(psid) ) throw { 'code': 400, 'message': 'Invalid invocation of getContact: PSID is invalid!'};

    await getContact({ psid: psid })
    .then(async contact => {
        console.log('===> Contact Exists! Updating Contact...');

        transactionHistory = contact.transactionHistory;
        transactionHistory.push(transaction);

        transactionHistory = standardToDyno(transactionHistory);
        if (membershipStart) membershipStart = standardToDyno(membershipStart);
        if (membershipEnd) membershipEnd = standardToDyno(membershipEnd);

        expressionAttributeNames = {}
        expressionAttributeValues = {}
        updateExpression = '';

        if (email) {
            expressionAttributeNames['#E'] = 'Email';
            expressionAttributeValues[':e'] = { S: email };
            updateExpression += ' #E = :e';
        }

        if (phoneNumber) {
            expressionAttributeNames['#PN'] = 'Phone Number';
            expressionAttributeValues[':pn'] = { S: phoneNumber };
            if (updateExpression) updateExpression += ',';
            updateExpression += ' #PN = :pn';
        }

        if (firstName) {
            expressionAttributeNames['#FN'] = 'First Name';
            expressionAttributeValues[':fn'] = { S: firstName };
            if (updateExpression) updateExpression += ',';
            updateExpression += ' #FN = :fn';
        }

        if (lastName) {
            expressionAttributeNames['#LN'] = 'Last Name';
            expressionAttributeValues[':ln'] = { S: lastName };
            if (updateExpression) updateExpression += ',';
            updateExpression += ' #LN = :ln';
        }

        if (shirtSize) {
            expressionAttributeNames['#SS'] = 'Shirt Size';
            expressionAttributeValues[':ss'] = { S: shirtSize };
            if (updateExpression) updateExpression += ',';
            updateExpression += ' #SS = :ss';
        }

        if (transactionHistory) {
            expressionAttributeNames['#TH'] = 'Transaction History';
            expressionAttributeValues[':th'] = transactionHistory;
            if (updateExpression) updateExpression += ',';
            updateExpression += ' #TH = :th';
        }

        if (membershipStart) {
            expressionAttributeNames['#MS'] = 'Membership Start';
            expressionAttributeValues[':ms'] = { M: membershipStart };
            if (updateExpression) updateExpression += ',';
            updateExpression += ' #MS = :ms';
        }

        if (membershipEnd) {
            expressionAttributeNames['#ME'] = 'Membership End';
            expressionAttributeValues[':me'] = { M: membershipEnd };
            if (updateExpression) updateExpression += ',';
            updateExpression += ' #ME = :me';
        }

        console.log(expressionAttributeNames, expressionAttributeValues, updateExpression)

        let params = {
            TableName: 'CougarCS-Contacts',
            Key: { 'PSID': { 'S': psid } },
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            UpdateExpression: 'SET' + updateExpression
        }
        let request = dynamodb.updateItem(params);
        await request.promise().then(
            async data => {
                console.log(`===> Contact ${psid} successfully updated!`)
            },
            async err => {
                console.log(`===> Internal Error -- AWS DynamoDB updateItem Failed! Error = ${err}`)
                throw { 'code': 500, 'message': `Internal Error -- AWS DynamoDB updateItem Failed! Error = ${err}` };
            }
        );
    })
    .catch(async err => {
        console.log('ERROR =', err)
        console.log('===> Contact Does Not Exist! Creating Contact...')

        if ( !(psid && email && firstName && lastName && transaction) ) throw { 'code': 400, 'message': 'Bad request to postContact. Missing one or more of the following required keys: psid, email, firstName, lastName, transaction.'};

        contactAdded = getFormattedDate( new Date() );
        transactionHistory = [ transaction ];

        const contact = new Contact(psid, email, phoneNumber, firstName, lastName, shirtSize, contactAdded, transactionHistory, membershipStart, membershipEnd);
        
        console.log('Contact =', contact.json());
        item = standardToDyno( contact.json() );
        console.log('Contact --> DynamoDB Form =', item);

        const params = { TableName: 'CougarCS-Contacts', Item: item };
        let request = dynamodb.putItem(params);
        await request.promise().then(
            async data => {
                console.log(`===> Contact ${psid} successfully created!`)
            },
            async err => {
                console.log(`===> Internal Error -- AWS DynamoDB putItem Failed! Error = ${err}`)
                throw { 'code': 500, 'message': `Internal Error -- AWS DynamoDB putItem Failed! Error = ${err}` };
            }
        );
    });
}

const deleteContact = async ({ psid, email }) => {
    if (psid) psid = psid.trim();
    if (email) email = email.trim();

    if (!psid) {
        console.log('===> No PSID provided. Fetching PSID...');

        if (!email) throw { 'code': 400, 'message': 'Invalid invocation of deleteContact: PSID and Email are Empty!'};

        await getContact({ email: email })
        .then(contact => {
            console.log('===> Contact Exists! Deleting Contact...');
            psid = contact.PSID;
        })
        .catch(err => {
            console.log(`===> Contact w/ Email = ${email} Does Not Exist!`);
            psid = null;
        })
    }

    if (psid == null || !Validation.PSID.test(psid)) return;
    else {
        const params = { TableName: 'CougarCS-Contacts', Key: { 'PSID': { 'S': psid } } };
        let request = dynamodb.deleteItem(params);
        await request.promise().then(
            async data => {
                console.log(`===> Contact ${psid} successfully deleted!`);
            },
            async err => {
                console.log(`===> Internal Error -- AWS DynamoDB deleteItem Failed! Error = ${err}`)
                throw { 'code': 500, 'message': `Internal Error -- AWS DynamoDB deleteItem Failed! Error = ${err}` };
            }
        );
    }
}

const getContacts = async () => {
    let contacts = []
    let lastEvalKey = 'start';
    let params = { TableName: 'CougarCS-Contacts' };

    while (lastEvalKey != null) {
        let request = dynamodb.scan(params);
        await request.promise().then(
            async data => {
                lastEvalKey = data.LastEvaluatedKey;
                const items = data.Items;
                items.forEach(item => contacts.push( getContactFromItem( AWS.DynamoDB.Converter.unmarshall(item) ) ))
            },
            async err => {
                console.log(`===> Internal Error -- AWS DynamoDB scan Failed! Error = ${err}`)
                throw { 'code': 500, 'message': `Internal Error -- AWS DynamoDB scan Failed! Error = ${err}` };
            }
        );
        params = { TableName: 'CougarCS-Contacts', ExclusiveStartKey: lastEvalKey};
    }

    return contacts;
}

// PRIVATE UTILITY FUNCTIONS

function getContactFromItem(item) {
    return new Contact( item.PSID, item.Email, item['Phone Number'],
                        item['First Name'], item['Last Name'], item['Shirt Size'],
                        item['Contact Added'], item['Transaction History'], item['Membership Start'], item['Membership End'] )
}

// Returns date as string: MM/dd/yyyy
function getFormattedDate(date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return month + '/' + day + '/' + year;
}

function standardToDyno(object, root=true) {
    // console.log(`===> std2Dyno Input "${JSON.stringify(object)}"`)
    let output = null;

    if (typeof object == 'number') output = { N: object };
    
    else if (typeof object == 'string') output = { S: object };

    else if (Array.isArray(object)) {
        temp = []
        object.forEach(element => temp.push( standardToDyno(element, false) ));
        object = temp;
        output = { L: object };
    }

    else if (typeof object == 'object') {
        output = {}
        Object.keys(object).forEach(key => {
            console.log(key)
            output[key] = standardToDyno(object[key], false)
        });
        if(!root) output = { M: output };
    }

    // console.log(`===> std2Dyno Output "${JSON.stringify(output)}"`)
    return output;
}

module.exports = { getContact, postContact, deleteContact, getContacts }