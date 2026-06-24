const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// Middleware to verify JWT token from Supabase
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(403).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      ...profile
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = authorizeRoles('admin');

// Middleware to check if user is agency or admin
const requireAgency = authorizeRoles('agency', 'admin');

// Middleware to check if user is customer or admin
const requireCustomer = authorizeRoles('customer', 'admin');

// Middleware to check if user owns the resource
const requireOwnership = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    if (req.user.role === 'admin') {
      return next(); // Admin can access everything
    }

    if (resourceId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources'
      });
    }

    next();
  };
};

// Middleware to check agency ownership
const requireAgencyOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the agency
    const { data: agency, error } = await supabaseAdmin
      .from('agencies')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (error || !agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    if (agency.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only manage your own agency'
      });
    }

    next();
  } catch (error) {
    console.error('Agency ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

// Middleware to check package ownership
const requirePackageOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the package through their agency
    const { data: package, error } = await supabaseAdmin
      .from('packages')
      .select(`
        id,
        agencies!inner(user_id)
      `)
      .eq('id', id)
      .single();

    if (error || !package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    if (package.agencies.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only manage packages from your agency'
      });
    }

    next();
  } catch (error) {
    console.error('Package ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireAgency,
  requireCustomer,
  requireOwnership,
  requireAgencyOwnership,
  requirePackageOwnership
};
