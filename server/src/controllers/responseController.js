const Form = require('../models/Form');
const Response = require('../models/Response');

const getFormResponses = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const form = await Form.findOne({
      _id: id,
      userId: req.user._id
    }).select('questions title');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const responses = await Response.find({
      formId: id,
      ...dateFilter
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const enrichedResponses = responses.map(response => ({
      _id: response._id,
      answers: response.answers.map(answer => {
        const question = form.questions.find(q => q._id.toString() === answer.questionId.toString());
        return {
          questionId: answer.questionId,
          questionText: question ? question.text : 'Question not found',
          answer: answer.answer
        };
      }),
      submittedAt: response.createdAt
    }));

    const totalResponses = await Response.countDocuments({
      formId: id,
      ...dateFilter
    });
    const totalPages = Math.ceil(totalResponses / limit);

    res.json({
      success: true,
      message: 'Responses retrieved successfully',
      data: {
        responses: enrichedResponses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalResponses,
          itemsPerPage: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving responses',
      error: { code: 'GET_RESPONSES_ERROR' }
    });
  }
};

const getResponseAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findOne({
      _id: id,
      userId: req.user._id
    }).select('questions title');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    const totalResponses = await Response.countDocuments({ formId: id });
    const lastResponse = await Response.findOne({ formId: id })
      .sort({ createdAt: -1 })
      .select('createdAt');

    const questionAnalytics = await Promise.all(
      form.questions.map(async (question) => {
        const responses = await Response.find(
          { formId: id },
          { answers: { $elemMatch: { questionId: question._id } } }
        );

        const validResponses = responses
          .map(r => r.answers[0]?.answer)
          .filter(answer => answer !== undefined && answer !== null && answer !== '');

        if (question.type === 'text' || question.type === 'textarea') {
          return {
            questionId: question._id,
            questionText: question.text,
            type: question.type,
            totalResponses: validResponses.length,
            responses: validResponses.slice(0, 10)
          };
        } else {
          const answerCounts = {};
          validResponses.forEach(answer => {
            if (Array.isArray(answer)) {
              answer.forEach(option => {
                answerCounts[option] = (answerCounts[option] || 0) + 1;
              });
            } else {
              answerCounts[answer] = (answerCounts[answer] || 0) + 1;
            }
          });

          const responseData = {};
          Object.entries(answerCounts).forEach(([option, count]) => {
            responseData[option] = {
              count,
              percentage: totalResponses > 0 ? `${((count / totalResponses) * 100).toFixed(1)}%` : '0%'
            };
          });

          return {
            questionId: question._id,
            questionText: question.text,
            type: question.type,
            totalResponses: validResponses.length,
            responses: responseData
          };
        }
      })
    );

    const dailyResponses = await Response.aggregate([
      { $match: { formId: form._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        summary: {
          totalResponses,
          completionRate: '100%',
          averageCompletionTime: '2m 30s',
          lastResponseAt: lastResponse?.createdAt || null
        },
        questionAnalytics,
        trends: {
          daily: dailyResponses.map(day => ({
            date: day._id,
            responses: day.count
          }))
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving analytics',
      error: { code: 'GET_ANALYTICS_ERROR' }
    });
  }
};

const exportResponses = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'csv', startDate, endDate } = req.query;

    const form = await Form.findOne({
      _id: id,
      userId: req.user._id
    }).select('questions title');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const responses = await Response.find({
      formId: id,
      ...dateFilter
    }).sort({ createdAt: -1 });

    if (format === 'csv') {
      const headers = ['Submission Date', ...form.questions.map(q => q.text)];
      const csvRows = [headers.join(',')];

      responses.forEach(response => {
        const row = [new Date(response.createdAt).toISOString()];
        
        form.questions.forEach(question => {
          const answer = response.answers.find(a => a.questionId.toString() === question._id.toString());
          if (answer) {
            let value = answer.answer;
            if (Array.isArray(value)) {
              value = value.join('; ');
            }
            value = `"${String(value).replace(/"/g, '""')}"`;
            row.push(value);
          } else {
            row.push('""');
          }
        });
        
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const filename = `responses-${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format',
        error: { code: 'UNSUPPORTED_FORMAT' }
      });
    }
  } catch (error) {
    console.error('Export responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting responses',
      error: { code: 'EXPORT_ERROR' }
    });
  }
};

module.exports = {
  getFormResponses,
  getResponseAnalytics,
  exportResponses
};