const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireCustomer, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      package_id, 
      rating, 
      verified,
      sort = 'created_at',
      order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('reviews')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        ),
        packages!inner (
          id,
          name,
          location,
          main_image,
          agencies!inner (
            id,
            agency_name,
            profiles!inner (
              id,
              full_name,
              username
            )
          )
        )
      `, { count: 'exact' });

    // Apply filters
    if (package_id) {
      query = query.eq('package_id', package_id);
    }
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }
    if (verified !== undefined) {
      query = query.eq('verified', verified === 'true');
    }

    // Apply sorting
    const validSortFields = ['created_at', 'rating'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortField, sortOrder).range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        ),
        packages!inner (
          id,
          name,
          location,
          main_image,
          agencies!inner (
            id,
            agency_name,
            profiles!inner (
              id,
              full_name,
              username
            )
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private (Customer)
router.post('/', authenticateToken, requireCustomer, validate(schemas.createReview), async (req, res) => {
  try {
    const { booking_id, package_id, rating, title, comment, images } = req.body;

    // Check if user owns the booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_id, status')
      .eq('id', booking_id)
      .eq('customer_id', req.user.id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if user already reviewed this booking
    const { data: existingReview, error: existingReviewError } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (existingReviewError && existingReviewError.code !== 'PGRST116') {
      return res.status(400).json({
        success: false,
        message: 'Failed to check existing review'
      });
    }

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Verify package_id matches booking
    const { data: bookingPackage, error: packageError } = await supabaseAdmin
      .from('bookings')
      .select('package_id')
      .eq('id', booking_id)
      .single();

    if (packageError || bookingPackage.package_id !== package_id) {
      return res.status(400).json({
        success: false,
        message: 'Package ID does not match booking'
      });
    }

    // Create review
    const reviewData = {
      booking_id,
      customer_id: req.user.id,
      package_id,
      rating,
      title,
      comment,
      images: images || [],
      verified: false
    };

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert(reviewData)
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        ),
        packages!inner (
          id,
          name,
          location,
          main_image
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create review'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (Review owner)
router.put('/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;

    // Check if user owns the review
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('customer_id', req.user.id)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    // Update review
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;
    if (images !== undefined) updateData.images = images;

    const { data: updatedReview, error } = await supabaseAdmin
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        ),
        packages!inner (
          id,
          name,
          location,
          main_image
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update review'
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (Review owner or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the review or is admin
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const canDelete = req.user.role === 'admin' || review.customer_id === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete review'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// @route   PUT /api/reviews/:id/verify
// @desc    Verify review (admin only)
// @access  Private (Admin)
router.put('/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Verified must be a boolean value'
      });
    }

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .update({
        verified,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        ),
        packages!inner (
          id,
          name,
          location,
          main_image
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update review verification'
      });
    }

    res.json({
      success: true,
      message: 'Review verification updated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Update review verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review verification'
    });
  }
});

// @route   GET /api/reviews/stats/overview
// @desc    Get review statistics overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const { package_id } = req.query;

    let query = supabaseAdmin
      .from('reviews')
      .select('rating, verified');

    if (package_id) {
      query = query.eq('package_id', package_id);
    }

    const { data: reviews, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch review statistics'
      });
    }

    // Calculate statistics
    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter(review => review.verified).length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      5: reviews.filter(review => review.rating === 5).length,
      4: reviews.filter(review => review.rating === 4).length,
      3: reviews.filter(review => review.rating === 3).length,
      2: reviews.filter(review => review.rating === 2).length,
      1: reviews.filter(review => review.rating === 1).length
    };

    const stats = {
      totalReviews,
      verifiedReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
});

// @route   GET /api/reviews/my
// @desc    Get current user's reviews
// @access  Private (Customer)
router.get('/my', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: reviews, error, count } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        packages!inner (
          id,
          name,
          location,
          main_image,
          agencies!inner (
            id,
            agency_name,
            profiles!inner (
              id,
              full_name,
              username
            )
          )
        )
      `, { count: 'exact' })
      .eq('customer_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews'
    });
  }
});

module.exports = router;
