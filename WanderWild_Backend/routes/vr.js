const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/vr/experiences
// @desc    Get all VR experiences
// @access  Public
router.get('/experiences', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'active',
      target_audience,
      difficulty_level,
      featured,
      search,
      sort = 'created_at',
      order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('vr_experiences')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (target_audience) {
      query = query.contains('target_audience', [target_audience]);
    }
    if (difficulty_level) {
      query = query.eq('difficulty_level', parseInt(difficulty_level));
    }
    if (featured !== undefined) {
      query = query.eq('featured', featured === 'true');
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'price', 'difficulty_level', 'title'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortField, sortOrder).range(offset, offset + limit - 1);

    const { data: experiences, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch VR experiences'
      });
    }

    res.json({
      success: true,
      data: {
        experiences,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get VR experiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VR experiences'
    });
  }
});

// @route   GET /api/vr/experiences/featured
// @desc    Get featured VR experiences
// @access  Public
router.get('/experiences/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const { data: experiences, error } = await supabaseAdmin
      .from('vr_experiences')
      .select('*')
      .eq('featured', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch featured VR experiences'
      });
    }

    res.json({
      success: true,
      data: { experiences }
    });
  } catch (error) {
    console.error('Get featured VR experiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured VR experiences'
    });
  }
});

// @route   GET /api/vr/experiences/:id
// @desc    Get VR experience by ID
// @access  Public
router.get('/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: experience, error } = await supabaseAdmin
      .from('vr_experiences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'VR experience not found'
      });
    }

    res.json({
      success: true,
      data: { experience }
    });
  } catch (error) {
    console.error('Get VR experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VR experience'
    });
  }
});

// @route   POST /api/vr/experiences
// @desc    Create new VR experience
// @access  Private (Admin)
router.post('/experiences', authenticateToken, requireAdmin, validate(schemas.createVRExperience), async (req, res) => {
  try {
    const { data: experience, error } = await supabaseAdmin
      .from('vr_experiences')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create VR experience'
      });
    }

    res.status(201).json({
      success: true,
      message: 'VR experience created successfully',
      data: { experience }
    });
  } catch (error) {
    console.error('Create VR experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create VR experience'
    });
  }
});

// @route   PUT /api/vr/experiences/:id
// @desc    Update VR experience
// @access  Private (Admin)
router.put('/experiences/:id', authenticateToken, requireAdmin, validate(schemas.createVRExperience), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: experience, error } = await supabaseAdmin
      .from('vr_experiences')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update VR experience'
      });
    }

    res.json({
      success: true,
      message: 'VR experience updated successfully',
      data: { experience }
    });
  } catch (error) {
    console.error('Update VR experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update VR experience'
    });
  }
});

// @route   DELETE /api/vr/experiences/:id
// @desc    Delete VR experience
// @access  Private (Admin)
router.delete('/experiences/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if experience has any bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('vr_bookings')
      .select('id')
      .eq('vr_experience_id', id)
      .limit(1);

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to check VR experience bookings'
      });
    }

    if (bookings && bookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete VR experience with existing bookings'
      });
    }

    const { error } = await supabaseAdmin
      .from('vr_experiences')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete VR experience'
      });
    }

    res.json({
      success: true,
      message: 'VR experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete VR experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete VR experience'
    });
  }
});

// @route   PUT /api/vr/experiences/:id/status
// @desc    Update VR experience status
// @access  Private (Admin)
router.put('/experiences/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const { data: experience, error } = await supabaseAdmin
      .from('vr_experiences')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update VR experience status'
      });
    }

    res.json({
      success: true,
      message: 'VR experience status updated successfully',
      data: { experience }
    });
  } catch (error) {
    console.error('Update VR experience status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update VR experience status'
    });
  }
});

// @route   PUT /api/vr/experiences/:id/featured
// @desc    Toggle VR experience featured status
// @access  Private (Admin)
router.put('/experiences/:id/featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Featured must be a boolean value'
      });
    }

    const { data: experience, error } = await supabaseAdmin
      .from('vr_experiences')
      .update({
        featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update VR experience featured status'
      });
    }

    res.json({
      success: true,
      message: 'VR experience featured status updated successfully',
      data: { experience }
    });
  } catch (error) {
    console.error('Update VR experience featured status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update VR experience featured status'
    });
  }
});

// @route   GET /api/vr/bookings
// @desc    Get all VR bookings (admin only)
// @access  Private (Admin)
router.get('/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      start_date,
      end_date,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('vr_bookings')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          email
        ),
        vr_experiences!inner (
          id,
          title,
          price,
          duration_minutes
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (start_date) {
      query = query.gte('booking_date', start_date);
    }
    if (end_date) {
      query = query.lte('booking_date', end_date);
    }
    if (search) {
      query = query.or(`profiles.full_name.ilike.%${search}%,vr_experiences.title.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch VR bookings'
      });
    }

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get VR bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VR bookings'
    });
  }
});

// @route   GET /api/vr/bookings/my
// @desc    Get current user's VR bookings
// @access  Private
router.get('/bookings/my', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('vr_bookings')
      .select(`
        *,
        vr_experiences!inner (
          id,
          title,
          description,
          price,
          duration_minutes,
          difficulty_level,
          target_audience,
          features,
          vr_content_url,
          thumbnail_url
        )
      `, { count: 'exact' })
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch VR bookings'
      });
    }

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user VR bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VR bookings'
    });
  }
});

// @route   GET /api/vr/bookings/:id
// @desc    Get VR booking by ID
// @access  Private
router.get('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error } = await supabaseAdmin
      .from('vr_bookings')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          email
        ),
        vr_experiences!inner (
          id,
          title,
          description,
          price,
          duration_minutes,
          difficulty_level,
          target_audience,
          features,
          vr_content_url,
          thumbnail_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'VR booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get VR booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VR booking'
    });
  }
});

// @route   POST /api/vr/bookings
// @desc    Create new VR booking
// @access  Private
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { vr_experience_id, booking_date, duration_minutes } = req.body;

    if (!vr_experience_id || !booking_date) {
      return res.status(400).json({
        success: false,
        message: 'VR experience ID and booking date are required'
      });
    }

    // Get VR experience details
    const { data: experience, error: experienceError } = await supabaseAdmin
      .from('vr_experiences')
      .select('*')
      .eq('id', vr_experience_id)
      .eq('status', 'active')
      .single();

    if (experienceError || !experience) {
      return res.status(404).json({
        success: false,
        message: 'VR experience not found or not available'
      });
    }

    // Calculate total amount
    const bookingDuration = duration_minutes || experience.duration_minutes;
    const totalAmount = (experience.price * bookingDuration) / 60; // Price per hour

    // Create booking
    const bookingData = {
      user_id: req.user.id,
      vr_experience_id,
      booking_date: new Date(booking_date).toISOString(),
      duration_minutes: bookingDuration,
      total_amount: totalAmount,
      status: 'confirmed'
    };

    const { data: booking, error } = await supabaseAdmin
      .from('vr_bookings')
      .insert(bookingData)
      .select(`
        *,
        vr_experiences!inner (
          id,
          title,
          description,
          price,
          duration_minutes,
          difficulty_level,
          target_audience,
          features,
          vr_content_url,
          thumbnail_url
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create VR booking'
      });
    }

    res.status(201).json({
      success: true,
      message: 'VR booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create VR booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create VR booking'
    });
  }
});

// @route   PUT /api/vr/bookings/:id/status
// @desc    Update VR booking status
// @access  Private (Admin or User for cancellation)
router.put('/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('vr_bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'VR booking not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' || 
                     (req.user.role === 'customer' && booking.user_id === req.user.id && status === 'cancelled');

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update VR booking status'
      });
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('vr_bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        vr_experiences!inner (
          id,
          title,
          description,
          price,
          duration_minutes,
          difficulty_level,
          target_audience,
          features,
          vr_content_url,
          thumbnail_url
        )
      `)
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update VR booking status'
      });
    }

    res.json({
      success: true,
      message: 'VR booking status updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Update VR booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update VR booking status'
    });
  }
});

// @route   GET /api/vr/stats
// @desc    Get VR experience statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Get total experiences
    const { data: experiences, error: experiencesError } = await supabaseAdmin
      .from('vr_experiences')
      .select('id, status, featured, target_audience, difficulty_level');

    if (experiencesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch VR experience statistics'
      });
    }

    // Get total bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('vr_bookings')
      .select('id, status, total_amount');

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch VR booking statistics'
      });
    }

    // Calculate statistics
    const totalExperiences = experiences.length;
    const activeExperiences = experiences.filter(exp => exp.status === 'active').length;
    const featuredExperiences = experiences.filter(exp => exp.featured).length;
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);

    // Audience distribution
    const audienceDistribution = {};
    experiences.forEach(exp => {
      exp.target_audience.forEach(audience => {
        audienceDistribution[audience] = (audienceDistribution[audience] || 0) + 1;
      });
    });

    // Difficulty distribution
    const difficultyDistribution = {};
    experiences.forEach(exp => {
      difficultyDistribution[exp.difficulty_level] = (difficultyDistribution[exp.difficulty_level] || 0) + 1;
    });

    const stats = {
      totalExperiences,
      activeExperiences,
      featuredExperiences,
      totalBookings,
      completedBookings,
      totalRevenue,
      audienceDistribution,
      difficultyDistribution
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get VR stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VR statistics'
    });
  }
});

module.exports = router;
