const { Router } = require('express');

const router = Router();
const key = '';

// GET /
router.get(
  '/',
  (req, res) => {
    console.log('\nGET /');
    res.status(200).json({ message: 'CougarCS Cloud 😸' });
  }
);

module.exports = router;
