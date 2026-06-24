const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAgency, requireAdmin, requireAgencyOwnership } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/agencies/me
// @desc    Get current user's agency
// @access  Private (Agency)
router.get('/me', authenticateToken, requireAgency, async (req, res) => {
  try {
    const { data: agency, error } = await supabaseAdmin
      .from('agencies')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('user_id', req.user.id)
      .single();

    if (error || !agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    res.json({
      success: true,
      data: { agency }
    });
  } catch (error) {
    console.error('Get my agency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency'
    });
  }
});

// @route   GET /api/agencies
// @desc    Get all agencies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, verification_status, search, country, city } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('agencies')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        )
      `, { count: 'exact' });

    // Apply filters
    if (verification_status) {
      query = query.eq('verification_status', verification_status);
    } else {
      // Only show verified agencies by default for public access
      query = query.eq('verification_status', 'verified');
    }

    if (search) {
      query = query.or(`agency_name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (city) {
      query = query.eq('city', city);
    }

    // Apply pagination and sorting
    query = query
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: agencies, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch agencies'
      });
    }

    res.json({
      success: true,
      data: {
        agencies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get agencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agencies'
    });
  }
});

// @route   GET /api/agencies/:id
// @desc    Get agency by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: agency, error } = await supabaseAdmin
      .from('agencies')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    res.json({
      success: true,
      data: { agency }
    });
  } catch (error) {
    console.error('Get agency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency'
    });
  }
});

// @route   POST /api/agencies
// @desc    Create new agency
// @access  Private (Agency role)
router.post('/', authenticateToken, requireAgency, validate(schemas.createAgency), async (req, res) => {
  try {
    // Check if user already has an agency
    const { data: existingAgency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (existingAgency) {
      return res.status(409).json({
        success: false,
        message: 'User already has an agency'
      });
    }

    const agencyData = {
      ...req.body,
      user_id: req.user.id
    };

    const { data: agency, error } = await supabaseAdmin
      .from('agencies')
      .insert(agencyData)
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create agency'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: { agency }
    });
  } catch (error) {
    console.error('Create agency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agency'
    });
  }
});

// @route   PUT /api/agencies/:id
// @desc    Update agency
// @access  Private (Agency owner or Admin)
router.put('/:id', authenticateToken, requireAgencyOwnership, validate(schemas.updateAgency), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: agency, error } = await supabaseAdmin
      .from('agencies')
      .update({
        ...updateData,
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
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update agency'
      });
    }

    res.json({
      success: true,
      message: 'Agency updated successfully',
      data: { agency }
    });
  } catch (error) {
    console.error('Update agency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update agency'
    });
  }
});

// @route   DELETE /api/agencies/:id
// @desc    Delete agency
// @access  Private (Agency owner or Admin)
router.delete('/:id', authenticateToken, requireAgencyOwnership, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if agency has any packages
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select('id')
      .eq('agency_id', id)
      .limit(1);

    if (packagesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to check agency packages'
      });
    }

    if (packages && packages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete agency with existing packages'
      });
    }

    const { error } = await supabaseAdmin
      .from('agencies')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete agency'
      });
    }

    res.json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error) {
    console.error('Delete agency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agency'
    });
  }
});

// @route   PUT /api/agencies/:id/verification
// @desc    Update agency verification status (admin only)
// @access  Private (Admin)
router.put('/:id/verification', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const { data: agency, error } = await supabaseAdmin
      .from('agencies')
      .update({
        verification_status,
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
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update verification status'
      });
    }

    res.json({
      success: true,
      message: 'Verification status updated successfully',
      data: { agency }
    });
  } catch (error) {
    console.error('Update verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status'
    });
  }
});

// @route   GET /api/agencies/:id/packages
// @desc    Get agency packages
// @access  Public
router.get('/:id/packages', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'active' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('packages')
      .select(`
        *,
        categories (
          id,
          name,
          icon
        )
      `, { count: 'exact' })
      .eq('agency_id', id);

    // Only filter by status if it's not 'all'
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: packages, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch agency packages'
      });
    }

    res.json({
      success: true,
      data: {
        packages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get agency packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency packages'
    });
  }
});

// @route   GET /api/agencies/:id/stats
// @desc    Get agency statistics
// @access  Private (Agency owner or Admin)
router.get('/:id/stats', authenticateToken, requireAgencyOwnership, async (req, res) => {
  try {
    const { id } = req.params;

    // Get package stats
    const { data: packageStats, error: packageError } = await supabaseAdmin
      .from('packages')
      .select('id, status, rating, total_reviews')
      .eq('agency_id', id);

    if (packageError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch package statistics'
      });
    }

    // Get booking stats
    const { data: bookingStats, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        status, 
        total_amount, 
        commission_amount,
        packages!inner (
          agency_id
        )
      `)
      .eq('packages.agency_id', id);

    if (bookingError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch booking statistics'
      });
    }

    // Calculate statistics
    const totalPackages = packageStats.length;
    const activePackages = packageStats.filter(pkg => pkg.status === 'active').length;
    const totalBookings = bookingStats.length;
    const totalRevenue = bookingStats.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
    const totalCommission = bookingStats.reduce((sum, booking) => sum + parseFloat(booking.commission_amount), 0);
    const averageRating = packageStats.length > 0 
      ? packageStats.reduce((sum, pkg) => sum + (pkg.rating || 0), 0) / packageStats.length 
      : 0;
    const totalReviews = packageStats.reduce((sum, pkg) => sum + (pkg.total_reviews || 0), 0);

    const stats = {
      totalPackages,
      activeBookings: totalBookings, // Map totalBookings to activeBookings for frontend
      totalRevenue,
      growthRate: 0 // TODO: Calculate growth rate when historical data is available
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get agency stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency statistics'
    });
  }
});

// @route   GET /api/agencies/:id/reviews
// @desc    Get agency reviews (through packages)
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: reviews, error, count } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        packages!inner (
          id,
          name,
          agency_id
        ),
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('packages.agency_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch agency reviews'
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
    console.error('Get agency reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency reviews'
    });
  }
});


// @route   GET /api/agencies/:id/bookings
// @desc    Get agency bookings
// @access  Private (Agency Owner)
router.get('/:id/bookings', authenticateToken, requireAgencyOwnership, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const { status, search } = req.query;

    console.log('Fetching bookings for agency:', agencyId);
    console.log('Filters - status:', status, 'search:', search);

    // First get all packages for this agency
    const { data: agencyPackages, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select('id')
      .eq('agency_id', agencyId);

    if (packagesError) {
      console.error('Error fetching agency packages:', packagesError);
      throw packagesError;
    }

    console.log('Agency packages:', agencyPackages);

    if (!agencyPackages || agencyPackages.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const packageIds = agencyPackages.map(pkg => pkg.id);

    // Now get all bookings for these packages
    let query = supabaseAdmin
      .from('bookings')
      .select('*')
      .in('package_id', packageIds);

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase());
    }

    const { data: bookings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    console.log('Found bookings:', bookings?.length || 0);

    // Now enrich bookings with package and customer data
    if (bookings && bookings.length > 0) {
      for (let booking of bookings) {
        // Get package details
        const { data: packageData } = await supabaseAdmin
          .from('packages')
          .select('id, name, price, duration_days, location, main_image')
          .eq('id', booking.package_id)
          .single();
        
        // Get customer profile details
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email, phone')
          .eq('id', booking.customer_id)
          .single();
        
        booking.packages = packageData;
        booking.profiles = profileData;
      }
    }

    res.json({
      success: true,
      data: bookings || []
    });
  } catch (error) {
    console.error('Get agency bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency bookings'
    });
  }
});

// @route   GET /api/agencies/:id/payments
// @desc    Get agency payments
// @access  Private (Agency Owner)
router.get('/:id/payments', authenticateToken, requireAgencyOwnership, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const { status, search } = req.query;

    let query = supabaseAdmin
      .from('payments')
      .select(`
        *,
        bookings!inner (
          id,
          packages!inner (
            id,
            name
          ),
          profiles!inner (
            id,
            full_name
          )
        )
      `)
      .eq('bookings.agency_id', agencyId);

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase());
    }

    if (search) {
      query = query.or(`bookings.packages.name.ilike.%${search}%,bookings.profiles.full_name.ilike.%${search}%`);
    }

    const { data: payments, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: payments || []
    });
  } catch (error) {
    console.error('Get agency payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency payments'
    });
  }
});

module.exports = router;
