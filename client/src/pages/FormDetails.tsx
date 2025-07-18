import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, Users, Calendar, BarChart3, Eye, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Form, Response, Analytics, Pagination } from '../types';
import { formsApi } from '../services/api';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const FormDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics'>('responses');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (id) {
      fetchFormData();
    }
  }, [id]);

  useEffect(() => {
    if (id && currentPage > 1) {
      fetchResponses(currentPage);
    }
  }, [currentPage, id]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const [formResponse, responsesResponse, analyticsResponse] = await Promise.all([
        formsApi.getById(id!),
        formsApi.getResponses(id!, { limit: 10, page: 1 }),
        formsApi.getAnalytics(id!),
      ]);

      if (formResponse.data.success) {
        setForm(formResponse.data.data);
      }

      if (responsesResponse.data.success) {
        setResponses(responsesResponse.data.data.responses);
        setPagination(responsesResponse.data.data.pagination);
      }

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch form data');
      console.error('Fetch form data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (page: number) => {
    try {
      const responsesResponse = await formsApi.getResponses(id!, { 
        limit: 10, 
        page 
      });

      if (responsesResponse.data.success) {
        setResponses(responsesResponse.data.data.responses);
        setPagination(responsesResponse.data.data.pagination);
      }
    } catch (error: any) {
      toast.error('Failed to fetch responses');
      console.error('Fetch responses error:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = async () => {
    try {
      const response = await formsApi.export(id!);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `responses-${form?.title || 'form'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Responses exported successfully!');
    } catch (error) {
      toast.error('Failed to export responses');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyFormLink = async (publicUrl: string) => {
    try {
      const fullUrl = `${window.location.origin}/f/${publicUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Form link copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/f/${publicUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Form link copied to clipboard!');
    }
  };

  if (loading) {
    return <Loading text="Loading form details..." />;
  }

  if (!form) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Form not found</h1>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mt-1">{form.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(form.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{form.responseCount || 0} responses</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => copyFormLink(form.publicUrl)}
              className="btn-secondary flex items-center space-x-2"
              title="Copy form link"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </button>
            <a
              href={`/f/${form.publicUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Public Form</span>
            </a>
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'responses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Responses</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'responses' && (
        <div className="space-y-6">
          {responses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
              <p className="text-gray-500 mb-6">Share your form to start collecting feedback</p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => copyFormLink(form.publicUrl)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={`/f/${form.publicUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  View Public Form
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Responses</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {responses.map((response) => (
                  <div key={response._id} className="px-6 py-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Response #{response._id.slice(-6)}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(response.submittedAt)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {response.answers.map((answer, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-3">
                          <p className="text-sm font-medium text-gray-700">
                            {answer.questionText}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {Array.isArray(answer.answer) 
                              ? answer.answer.join(', ') 
                              : answer.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                      {pagination.totalItems} responses
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className={`p-2 rounded-md ${
                          pagination.hasPrev
                            ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            const current = pagination.currentPage;
                            return page === 1 || 
                                   page === pagination.totalPages || 
                                   (page >= current - 1 && page <= current + 1);
                          })
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 py-1 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  page === pagination.currentPage
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className={`p-2 rounded-md ${
                          pagination.hasNext
                            ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Responses</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics.summary.totalResponses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics.summary.completionRate}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg. Time</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics.summary.averageCompletionTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Last Response</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {analytics.summary.lastResponseAt 
                      ? formatDate(analytics.summary.lastResponseAt)
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {analytics.questionAnalytics.map((question) => (
              <div key={question.questionId} className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {question.questionText}
                </h4>
                
                {question.type === 'text' || question.type === 'textarea' ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      {question.totalResponses} responses
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {question.responses.slice(0, 5).map((response: string, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          "{response}"
                        </div>
                      ))}
                      {question.responses.length > 5 && (
                        <p className="text-xs text-gray-500">
                          And {question.responses.length - 5} more responses...
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(question.responses).map(([option, data]: [string, any]) => (
                      <div key={option} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{option}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: data.percentage }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12">
                            {data.count}
                          </span>
                          <span className="text-xs text-gray-500 w-10">
                            {data.percentage}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDetails;
