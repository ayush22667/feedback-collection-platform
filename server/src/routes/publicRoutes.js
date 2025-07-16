const express = require('express');
const rateLimit = require('express-rate-limit');
const { getPublicForm, submitFormResponse } = require('../controllers/publicController');
const { validateResponse } = require('../middleware/validation');

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many form submissions from this IP, please try again later.',
    error: { code: 'SUBMISSION_RATE_LIMIT' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/forms/:publicUrl', getPublicForm);
router.post('/forms/:publicUrl/submit', submitLimiter, validateResponse, submitFormResponse);

module.exports = router;