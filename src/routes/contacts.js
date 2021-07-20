const { Router } = require('express');

const { getContacts } = require('../services/contactService');

const router = Router();
const key = 'contacts';

// GET /contacts
// Fetch all contacts
router.get(
    '/',
    async (req, res) => {
        console.log('\nGET /contact');
        
        try {
            const { contacts } = await getContacts();

            console.log('Contacts successfully retrieved. Contacts:', contacts);

            return res.status(200).json(contact.json());
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