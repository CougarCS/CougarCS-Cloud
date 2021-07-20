const { Router } = require('express');

const { getContacts } = require('../services/contactService');

const router = Router();
const key = 'contacts';

// GET /contacts
// Fetch all contacts
router.get(
    '/',
    async (req, res) => {
        console.log('\nGET /contacts');
        
        try {
            await getContacts()
            .then(contacts => {
                console.log('Contacts successfully retrieved. Contacts:', contacts);

                const length = contacts.length;

                let memberCount = 0;
                for (contact in contacts) {
                    if (contact.member) memberCount += 1;
                }

                return res.status(200).json({ length: length, memberCount: memberCount, contacts: contacts });
            });
        } catch (err) {
            console.error(
                `${err.code || 500} - ${err.message} - ${req.originalUrl} - ${
                    req.method
                } - ${req.ip}`
            );
            return res.status(500).json({ message: err.message });
        }
    }
);

module.exports = router;