const { Router } = require('express');

const { authenticateJWT } = require('../utils/calls');
const { getContact, postContact, deleteContact } = require('../services/contactService');

const router = Router();
const key = 'contact';

// GET /contact
// QUERY psid OR email
// Get Contact by psid/email
router.get(
    '/',
    authenticateJWT,
    async (req, res) => {
        console.log('\nGET /contact');

        const { psid, email } = req.query;
        if (!psid && !email) {
            console.info('PSID and Email are empty. Bad request.');
            return res.status(400).json({ message: 'Must contain "psid" or "email".' });
        }
        
        try {
            await getContact({ psid: psid, email: email })
            .then(contact => {
                console.log('Contact successfully retrieved.\nContact =', contact.json());

                res.status(200).send(contact.json());
            });
        } catch (err) {
            console.error(
                `${err.code || 500} - ${err.message} - ${req.originalUrl} - ${
                    req.method
                } - ${req.ip}`
            );
            return res.status(err.code).json({ message: err.message });
        }
    }
);

/* POST /contact
 * BODY:
 * - PSID *
 * - Email *
 * - Phone Number (opt)
 * - First Name *
 * - Last Name *
 * - Shirt Size
 * - Transaction *
 * - Membership Start
 * - Membership End
 * DESC: Create contact if does not exist, otherwise update. Contact Add is calculated
 */
router.post(
    '/',
    authenticateJWT,
    async (req, res) => {
        console.log('\nPOST /contact');

        console.log(req.body)
        console.log(req.body.membershipStart);
        console.log(req.body.membershipEnd);
    
        const { psid, email, phoneNumber, firstName, lastName, shirtSize, transaction, membershipStart, membershipEnd } = req.body;

        console.log(membershipStart, membershipEnd);

        console.log('==========================');
        
        await postContact({ psid, email, phoneNumber, firstName, lastName, shirtSize, transaction, membershipStart, membershipEnd })
        .then(() => {
            console.log(`===> Contact ${psid} was successfully post!`);
            res.status(200).json({ message: `Contact ${psid} was successfully post!`});
        })
        .catch(err => {
            console.log('===> Error invoking Post Contact! Error =', err);
            res.status(err.code).json({ message: err.message });
        })
    }
);

// DELETE /contact
// Delete Contact by psid/email
router.delete(
    '/',
    authenticateJWT,
    async (req, res) => {
        console.log('\nDELETE /contact');
    
        const { psid, email } = req.query;
        if (!psid && !email) {
            console.info('PSID and Email are empty. Bad request.');
            return res.status(400).json({ message: 'Must contain "psid" or "email".' });
        }
    
        await deleteContact({ psid: psid, email: email })
        .then(() => {
            res.status(200).json({ message: `Contact ${psid} was successfully deleted!`});
        })
        .catch(err => {
            console.log('===> Error in DELETE /contact. Error =', err);
            res.status(err.code).json({ message: err.message });
        });
    }
);

// GET /contact/status
// QUERY psid OR email
// Get Contact by psid/email
router.get(
    '/status',
    async (req, res) => {
        console.log('\nGET /contact/status');

        const { psid, email } = req.query;
        if (!psid && !email) {
            console.info('PSID and Email are empty. Bad request.');
            return res.status(400).json({ message: "Must contain 'psid' or 'email' in query parameters." });
        }
        
        try {
            await getContact({ psid: psid, email: email })
            .then(contact => {
                const output = {
                    'Membership Status': contact.isMember(),
                    'PSID': contact.psid,
                    'Name': contact.getName(),
                    'Membership Start': contact.membershipStart,
                    'Membership End': contact.membershipEnd,
                    'Transaction History': contact.transactionHistory
                };

                console.log('Contact status successfully retrieved.\nContact =', output);

                res.status(200).json(output);
            });
        } catch (err) {
            console.error(
                `${err.code || 500} - ${err.message} - ${req.originalUrl} - ${
                    req.method
                } - ${req.ip}`
            );
            return res.status(err.code).json({ message: err.message });
        }
    }
)

module.exports = router;