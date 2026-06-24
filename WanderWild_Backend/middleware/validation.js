const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  // User schemas
  createProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    date_of_birth: Joi.date().max('now').optional(),
    role: Joi.string().valid('customer', 'agency', 'admin').required()
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    date_of_birth: Joi.date().max('now').optional(),
    avatar_url: Joi.string().uri().optional()
  }),

  // Agency schemas
  createAgency: Joi.object({
    agency_name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).optional(),
    license_number: Joi.string().max(50).optional(),
    website: Joi.string().uri().optional(),
    address: Joi.string().max(200).optional(),
    city: Joi.string().max(50).optional(),
    country: Joi.string().max(50).optional(),
    postal_code: Joi.string().max(20).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    email: Joi.string().email().optional()
  }),

  updateAgency: Joi.object({
    agency_name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(1000).optional(),
    license_number: Joi.string().max(50).optional(),
    website: Joi.string().uri().optional(),
    address: Joi.string().max(200).optional(),
    city: Joi.string().max(50).optional(),
    country: Joi.string().max(50).optional(),
    postal_code: Joi.string().max(20).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    email: Joi.string().email().optional()
  }),

  // Package schemas
  createPackage: Joi.object({
    category_id: Joi.string().uuid().required(),
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().min(10).max(5000).required(),
    short_description: Joi.string().max(500).optional(),
    price: Joi.number().positive().precision(2).required(),
    duration_days: Joi.number().integer().min(1).max(365).required(),
    duration_nights: Joi.number().integer().min(0).max(364).optional(),
    location: Joi.string().min(2).max(100).required(),
    country: Joi.string().max(50).optional(),
    city: Joi.string().max(50).optional(),
    max_people: Joi.number().integer().min(1).max(100).required(),
    min_people: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('draft', 'active', 'inactive', 'pending_approval').default('draft'),
    highlights: Joi.array().items(Joi.string().max(200)).max(20).optional(),
    itinerary: Joi.object().optional(),
    includes: Joi.array().items(Joi.string().max(200)).max(20).optional(),
    excludes: Joi.array().items(Joi.string().max(200)).max(20).optional(),
    images: Joi.array().items(Joi.string().uri()).max(10).optional(),
    main_image: Joi.string().uri().optional()
  }),

  updatePackage: Joi.object({
    category_id: Joi.string().uuid().optional(),
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().min(10).max(5000).optional(),
    short_description: Joi.string().max(500).optional(),
    price: Joi.number().positive().precision(2).optional(),
    duration_days: Joi.number().integer().min(1).max(365).optional(),
    duration_nights: Joi.number().integer().min(0).max(364).optional(),
    location: Joi.string().min(2).max(100).optional(),
    country: Joi.string().max(50).optional(),
    city: Joi.string().max(50).optional(),
    max_people: Joi.number().integer().min(1).max(100).optional(),
    min_people: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('draft', 'active', 'inactive', 'pending_approval').optional(),
    featured: Joi.boolean().optional(),
    highlights: Joi.array().items(Joi.string().max(200)).max(20).optional(),
    itinerary: Joi.object().optional(),
    includes: Joi.array().items(Joi.string().max(200)).max(20).optional(),
    excludes: Joi.array().items(Joi.string().max(200)).max(20).optional(),
    images: Joi.array().items(Joi.string().uri()).max(10).optional(),
    main_image: Joi.string().uri().optional()
  }),

  // Booking schemas
  createBooking: Joi.object({
    package_id: Joi.string().uuid().required(),
    travelers: Joi.number().integer().min(1).max(100).required(),
    start_date: Joi.date().min('now').required(),
    end_date: Joi.date().min(Joi.ref('start_date')).required(),
    special_requests: Joi.string().max(1000).optional()
  }),

  // Review schemas
  createReview: Joi.object({
    booking_id: Joi.string().uuid().required(),
    package_id: Joi.string().uuid().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().min(2).max(100).optional(),
    comment: Joi.string().min(10).max(1000).optional(),
    images: Joi.array().items(Joi.string().uri()).max(5).optional()
  }),

  // Chat schemas
  createChatSession: Joi.object({
    session_name: Joi.string().min(2).max(100).optional()
  }),

  createChatMessage: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    metadata: Joi.object().optional()
  }),

  // AI Itinerary schemas
  createItinerary: Joi.object({
    destination: Joi.string().min(2).max(100).required(),
    duration_days: Joi.number().integer().min(1).max(365).required(),
    budget_range: Joi.string().max(50).optional(),
    interests: Joi.array().items(Joi.string().max(50)).max(10).optional()
  }),

  // Inquiry schemas
  createInquiry: Joi.object({
    agency_id: Joi.string().uuid().required(),
    package_id: Joi.string().uuid().optional(),
    subject: Joi.string().min(2).max(200).required(),
    message: Joi.string().min(10).max(2000).required(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional()
  }),

  createInquiryMessage: Joi.object({
    message: Joi.string().min(1).max(2000).required(),
    attachments: Joi.array().items(Joi.string().uri()).max(5).optional()
  }),

  // VR Experience schemas
  createVRExperience: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    price: Joi.number().positive().precision(2).required(),
    duration_minutes: Joi.number().integer().min(5).max(300).required(),
    difficulty_level: Joi.number().integer().min(1).max(5).required(),
    target_audience: Joi.array().items(Joi.string().valid('ELDERLY', 'STUDENT', 'OKU', 'GENERAL')).min(1).required(),
    features: Joi.array().items(Joi.string().max(100)).max(10).optional(),
    vr_content_url: Joi.string().uri().optional(),
    thumbnail_url: Joi.string().uri().optional()
  }),

  // Category schemas
  createCategory: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(500).optional(),
    icon: Joi.string().max(50).optional()
  }),

  // Query parameter schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().max(50).optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  packageFilters: Joi.object({
    category_id: Joi.string().uuid().optional(),
    location: Joi.string().max(100).optional(),
    country: Joi.string().max(50).optional(),
    city: Joi.string().max(50).optional(),
    min_price: Joi.number().min(0).optional(),
    max_price: Joi.number().min(0).optional(),
    min_duration: Joi.number().integer().min(1).optional(),
    max_duration: Joi.number().integer().min(1).optional(),
    min_rating: Joi.number().min(0).max(5).optional(),
    featured: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive', 'draft').optional()
  })
};

module.exports = {
  validate,
  schemas
};
