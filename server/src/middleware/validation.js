const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        }))
      }
    });
  }
  next();
};

const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateForm = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Form title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Form description cannot exceed 500 characters'),
  body('questions')
    .isArray({ min: 3, max: 5 })
    .withMessage('Form must have between 3 and 5 questions'),
  body('questions.*.text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Question text must be between 1 and 500 characters'),
  body('questions.*.type')
    .isIn(['text', 'radio', 'checkbox', 'textarea'])
    .withMessage('Invalid question type'),
  body('questions.*.required')
    .optional()
    .isBoolean()
    .withMessage('Required field must be boolean'),
  handleValidationErrors
];

const validateResponse = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Response must have at least one answer'),
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Invalid question ID'),
  body('answers.*.answer')
    .notEmpty()
    .withMessage('Answer cannot be empty'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForm,
  validateResponse,
  handleValidationErrors
};