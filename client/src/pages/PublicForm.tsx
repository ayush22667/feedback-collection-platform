import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Form, Question } from '../types';
import { publicApi } from '../services/api';
import Loading from '../components/common/Loading';

const PublicForm: React.FC = () => {
  const { publicUrl } = useParams<{ publicUrl: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  useEffect(() => {
    if (publicUrl) {
      fetchForm();
    }
  }, [publicUrl]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await publicApi.getForm(publicUrl!);
      
      if (response.data.success) {
        setForm(response.data.data);
      } else {
        setError('Form not found or inactive');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!form) return;

    setSubmitting(true);
    try {
      const answers = form.questions.map((question) => {
        const answer = data[question._id];
        return {
          questionId: question._id,
          answer: question.type === 'checkbox' && Array.isArray(answer)
            ? answer.filter(Boolean)
            : answer || '',
        };
      });

      const response = await publicApi.submitResponse(publicUrl!, { answers });
      
      if (response.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const fieldName = question._id;
    const hasError = errors[fieldName];

    switch (question.type) {
      case 'text':
        return (
          <input
            {...register(fieldName, { 
              required: question.required ? 'This field is required' : false 
            })}
            type="text"
            className={`input ${hasError ? 'border-red-300' : ''}`}
            placeholder="Enter your answer"
          />
        );

      case 'textarea':
        return (
          <textarea
            {...register(fieldName, { 
              required: question.required ? 'This field is required' : false 
            })}
            rows={4}
            className={`input ${hasError ? 'border-red-300' : ''}`}
            placeholder="Enter your answer"
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  {...register(fieldName, { 
                    required: question.required ? 'This field is required' : false 
                  })}
                  type="radio"
                  value={option}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  {...register(`${fieldName}.${index}`, {
                    validate: question.required 
                      ? (value) => {
                          const formData = watch();
                          const checkboxValues = formData[fieldName];
                          const hasSelection = checkboxValues && Object.values(checkboxValues).some(Boolean);
                          return hasSelection || 'At least one option must be selected';
                        }
                      : undefined
                  })}
                  type="checkbox"
                  value={option}
                  className="text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Loading text="Loading form..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Form
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Thank You!
          </h1>
          <p className="text-gray-600">
            Your feedback has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 mb-4">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {form.questions
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <div key={question._id} className="space-y-3">
                  <label className="block">
                    <div className="flex items-start space-x-2 mb-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 text-sm font-medium rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {question.text}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {renderQuestion(question)}
                  </label>
                  {errors[question._id] && (
                    <p className="text-sm text-red-600">
                      {errors[question._id]?.message as string}
                    </p>
                  )}
                </div>
              ))}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Powered by Feedback Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicForm;