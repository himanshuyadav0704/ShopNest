const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { getAdminStates} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/', protect, admin, getAdminStates);

module.exports = router;