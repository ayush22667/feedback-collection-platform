const Form = require('../models/Form');
const Response = require('../models/Response');

const createForm = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    const form = new Form({
      userId: req.user._id,
      title,
      description,
      questions
    });

    await form.save();

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: {
        formId: form._id,
        title: form.title,
        publicUrl: form.publicUrl,
        shareLink: `${process.env.CLIENT_URL}/f/${form.publicUrl}`
      }
    });
  } catch (error) {
    console.error('Form creation error:', error);
    
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
      message: 'Server error during form creation',
      error: { code: 'FORM_CREATION_ERROR' }
    });
  }
};

const getForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { userId: req.user._id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const forms = await Form.find(query)
      .select('title description publicUrl isActive createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const formsWithResponseCount = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ formId: form._id });
        return {
          ...form,
          responseCount
        };
      })
    );

    const totalForms = await Form.countDocuments(query);
    const totalPages = Math.ceil(totalForms / limit);

    res.json({
      success: true,
      message: 'Forms retrieved successfully',
      data: {
        forms: formsWithResponseCount,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalForms,
          itemsPerPage: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving forms',
      error: { code: 'GET_FORMS_ERROR' }
    });
  }
};

const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await Form.findOne({
      _id: id,
      userId: req.user._id
    }).lean();

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    const responseCount = await Response.countDocuments({ formId: form._id });

    res.json({
      success: true,
      message: 'Form retrieved successfully',
      data: {
        ...form,
        responseCount,
        shareLink: `${process.env.CLIENT_URL}/f/${form.publicUrl}`
      }
    });
  } catch (error) {
    console.error('Get form by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving form',
      error: { code: 'GET_FORM_ERROR' }
    });
  }
};

const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedUpdates = ['title', 'description', 'isActive'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const form = await Form.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      filteredUpdates,
      { new: true, runValidators: true }
    ).lean();

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    res.json({
      success: true,
      message: 'Form updated successfully',
      data: form
    });
  } catch (error) {
    console.error('Update form error:', error);
    
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
      message: 'Server error while updating form',
      error: { code: 'UPDATE_FORM_ERROR' }
    });
  }
};

const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
        error: { code: 'FORM_NOT_FOUND' }
      });
    }

    await Response.deleteMany({ formId: id });

    res.json({
      success: true,
      message: 'Form and all responses deleted successfully'
    });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting form',
      error: { code: 'DELETE_FORM_ERROR' }
    });
  }
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm
};