import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { formsApi } from '../services/api';
import toast from 'react-hot-toast';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(500, 'Question text too long'),
  type: z.enum(['text', 'textarea', 'radio', 'checkbox']),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
}).refine((data) => {
  if (['radio', 'checkbox'].includes(data.type)) {
    return data.options && data.options.length >= 2;
  }
  return true;
}, {
  message: 'Radio and checkbox questions must have at least 2 options',
  path: ['options']
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  questions: z.array(questionSchema).min(3, 'Form must have at least 3 questions').max(5, 'Form can have at most 5 questions'),
});

type FormData = z.infer<typeof formSchema>;

const CreateForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [
        { text: '', type: 'text', required: false },
        { text: '', type: 'text', required: false },
        { text: '', type: 'text', required: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedQuestions = watch('questions');

  const addQuestion = () => {
    if (fields.length < 5) {
      append({ text: '', type: 'text', required: false });
    }
  };

  const removeQuestion = (index: number) => {
    if (fields.length > 3) {
      remove(index);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        questions: data.questions.map((question, index) => ({
          ...question,
          order: index + 1,
          options: ['radio', 'checkbox'].includes(question.type) ? question.options : undefined,
        })),
      };

      const response = await formsApi.create(formData);
      
      if (response.data.success) {
        toast.success('Form created successfully!');
        navigate('/dashboard');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="page-header">
            <h1 className="page-title">Create New Form</h1>
            <p className="page-subtitle">Build a beautiful feedback form with 3-5 questions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 slide-up">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Form Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Form Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className={`input ${errors.title ? 'border-red-300' : ''}`}
                placeholder="e.g., Customer Satisfaction Survey"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className={`input ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Brief description of your form"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              disabled={fields.length >= 5}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="question-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Question {index + 1}
                  </h3>
                  {fields.length > 3 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text *
                    </label>
                    <input
                      {...register(`questions.${index}.text`)}
                      type="text"
                      className={`input ${errors.questions?.[index]?.text ? 'border-red-300' : ''}`}
                      placeholder="Enter your question"
                    />
                    {errors.questions?.[index]?.text && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.questions[index]?.text?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type
                      </label>
                      <select
                        {...register(`questions.${index}.type`)}
                        className="input"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="radio">Single Choice</option>
                        <option value="checkbox">Multiple Choice</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          {...register(`questions.${index}.required`)}
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                  </div>

                  {['radio', 'checkbox'].includes(watchedQuestions[index]?.type) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options (one per line)
                      </label>
                      <textarea
                        {...register(`questions.${index}.options`, {
                          setValueAs: (value) => {
                            if (typeof value === 'string') {
                              return value.split('\n').filter(option => option.trim() !== '');
                            }
                            return value;
                          }
                        })}
                        rows={4}
                        className="input"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter each option on a new line (minimum 2 options required)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.questions && typeof errors.questions.message === 'string' && (
            <p className="mt-4 text-sm text-red-600">{errors.questions.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? 'Creating...' : 'Create Form'}</span>
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default CreateForm;
