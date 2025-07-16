const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    maxlength: [500, 'Question text cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['text', 'radio', 'checkbox', 'textarea']
  },
  options: [{
    type: String,
    maxlength: [200, 'Option text cannot exceed 200 characters']
  }],
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: true });

const formSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Form title is required'],
    trim: true,
    maxlength: [200, 'Form title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Form description cannot exceed 500 characters']
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(questions) {
        return questions.length >= 3 && questions.length <= 5;
      },
      message: 'Form must have between 3 and 5 questions'
    }
  },
  publicUrl: {
    type: String,
    unique: true,
    default: () => nanoid(8)
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

formSchema.pre('validate', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.questions.forEach((question, index) => {
      if (!question.order) {
        question.order = index + 1;
      }
      
      if ((question.type === 'radio' || question.type === 'checkbox') && 
          (!question.options || question.options.length < 2)) {
        return next(new Error(`Question "${question.text}" must have at least 2 options`));
      }
    });
  }
  next();
});

formSchema.index({ userId: 1, createdAt: -1 });
formSchema.index({ publicUrl: 1 });

module.exports = mongoose.model('Form', formSchema);