const Form = require('../models/Form');
const Response = require('../models/Response');

const getPublicForm = async (req, res) => {
  try {
    const { publicUrl } = req.params;

    const form = await Form.findOne({
      publicUrl,
      isActive: true
    }).select('title description questions').lean();

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or inactive',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    const cleanedQuestions = form.questions.map(question => ({
      _id: question._id,
      text: question.text,
      type: question.type,
      options: question.options || [],
      required: question.required,
      order: question.order
    }));

    res.json({
      success: true,
      message: 'Form retrieved successfully',
      data: {
        title: form.title,
        description: form.description,
        questions: cleanedQuestions.sort((a, b) => a.order - b.order)
      }
    });
  } catch (error) {
    console.error('Get public form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving form',
      error: { code: 'GET_FORM_ERROR' }
    });
  }
};

const submitFormResponse = async (req, res) => {
  try {
    const { publicUrl } = req.params;
    const { answers } = req.body;

    const form = await Form.findOne({
      publicUrl,
      isActive: true
    }).select('questions');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or inactive',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    const validationErrors = [];
    const answeredQuestionIds = new Set(answers.map(a => a.questionId));

    form.questions.forEach(question => {
      if (question.required && !answeredQuestionIds.has(question._id.toString())) {
        validationErrors.push({
          field: `question_${question._id}`,
          message: `"${question.text}" is required`
        });
      }
    });

    answers.forEach((answer, index) => {
      const question = form.questions.find(q => q._id.toString() === answer.questionId);
      
      if (!question) {
        validationErrors.push({
          field: `answers[${index}]`,
          message: 'Invalid question ID'
        });
        return;
      }

      if (!answer.answer || (Array.isArray(answer.answer) && answer.answer.length === 0)) {
        if (question.required) {
          validationErrors.push({
            field: `answers[${index}]`,
            message: 'This question is required'
          });
        }
        return;
      }

      if (question.type === 'text' || question.type === 'textarea') {
        if (typeof answer.answer !== 'string') {
          validationErrors.push({
            field: `answers[${index}]`,
            message: 'Answer must be text'
          });
        } else if (answer.answer.length > 1000) {
          validationErrors.push({
            field: `answers[${index}]`,
            message: 'Answer too long (max 1000 characters)'
          });
        }
      } else if (question.type === 'radio') {
        if (typeof answer.answer !== 'string' || !question.options.includes(answer.answer)) {
          validationErrors.push({
            field: `answers[${index}]`,
            message: 'Invalid option selected'
          });
        }
      } else if (question.type === 'checkbox') {
        if (!Array.isArray(answer.answer) || 
            !answer.answer.every(option => question.options.includes(option))) {
          validationErrors.push({
            field: `answers[${index}]`,
            message: 'Invalid options selected'
          });
        }
      }
    });

    if (validationErrors.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }

    const startTime = Date.now();
    
    const response = new Response({
      formId: form._id,
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer
      })),
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        submissionTime: Date.now() - startTime
      }
    });

    await response.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        responseId: response._id,
        submittedAt: response.createdAt
      }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while submitting response',
      error: { code: 'SUBMISSION_ERROR' }
    });
  }
};

module.exports = {
  getPublicForm,
  submitFormResponse
};