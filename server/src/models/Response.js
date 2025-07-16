const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  answers: {
    type: [answerSchema],
    required: true,
    validate: {
      validator: function(answers) {
        return answers && answers.length > 0;
      },
      message: 'Response must have at least one answer'
    }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    submissionTime: Number
  }
}, {
  timestamps: true
});

responseSchema.index({ formId: 1, createdAt: -1 });

module.exports = mongoose.model('Response', responseSchema);