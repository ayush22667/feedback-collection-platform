const express = require('express');
const {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm
} = require('../controllers/formController');
const {
  getFormResponses,
  getResponseAnalytics,
  exportResponses
} = require('../controllers/responseController');
const { validateForm } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/', validateForm, createForm);
router.get('/', getForms);
router.get('/:id', getFormById);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

router.get('/:id/responses', getFormResponses);
router.get('/:id/analytics', getResponseAnalytics);
router.get('/:id/export', exportResponses);

module.exports = router;