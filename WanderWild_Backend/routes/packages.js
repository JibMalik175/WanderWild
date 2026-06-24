const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAgency, requireAdmin, requirePackageOwnership } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/packages
// @desc    Get all packages with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category_id, 
      location, 
      country, 
      city, 
      min_price, 
      max_price, 
      min_duration, 
      max_duration, 
      min_rating, 
      featured, 
      status = 'active',
      search,
      sort = 'created_at',
      order = 'desc',
      agency_verification_status
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('packages')
      .select(`
        *,
        categories (
          id,
          name,
          icon
        ),
        agencies!inner (
          id,
          agency_name,
          verification_status,
          rating,
          profiles!inner (
            id,
            full_name,
            username
          )
        )
      `, { count: 'exact' });

    // Apply filters
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (min_price) {
      query = query.gte('price', min_price);
    }
    if (max_price) {
      query = query.lte('price', max_price);
    }
    if (min_duration) {
      query = query.gte('duration_days', min_duration);
    }
    if (max_duration) {
      query = query.lte('duration_days', max_duration);
    }
    if (min_rating) {
      query = query.gte('rating', min_rating);
    }
    if (featured !== undefined) {
      query = query.eq('featured', featured === 'true');
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Filter by agency verification status
    if (agency_verification_status) {
      query = query.eq('agencies.verification_status', agency_verification_status);
    } else if (status === 'active') {
      // Only show packages from verified agencies for public access
      // Allow pending agencies to show their packages for testing/demo purposes
      query = query.in('agencies.verification_status', ['verified', 'pending']);
    }
    // Don't apply agency verification filter when status is 'all' (for admin view)

    // Apply sorting
    const validSortFields = ['created_at', 'price', 'rating', 'name', 'duration_days'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortField, sortOrder).range(offset, offset + limit - 1);

    const { data: packages, error, count } = await query;

    if (error) {
      console.error('Packages query error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch packages'
      });
    }

    // Debug logging
    console.log(`Found ${packages?.length || 0} packages (total: ${count})`);
    if (packages && packages.length > 0) {
      console.log('Sample package:', {
        id: packages[0].id,
        name: packages[0].name,
        status: packages[0].status,
        agency_verification: packages[0].agencies?.verification_status
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
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages'
    });
  }
});

// @route   GET /api/packages/featured
// @desc    Get featured packages
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select(`
        *,
        categories (
          id,
          name,
          icon
        ),
        agencies!inner (
          id,
          agency_name,
          verification_status,
          profiles!inner (
            id,
            full_name,
            username
          )
        )
      `)
      .eq('featured', true)
      .eq('status', 'active')
      .eq('agencies.verification_status', 'verified')
      .order('rating', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch featured packages'
      });
    }

    res.json({
      success: true,
      data: { packages }
    });
  } catch (error) {
    console.error('Get featured packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured packages'
    });
  }
});

// @route   GET /api/packages/:id
// @desc    Get package by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: package, error } = await supabaseAdmin
      .from('packages')
      .select(`
        *,
        categories (
          id,
          name,
          icon
        ),
        agencies!inner (
          id,
          agency_name,
          description,
          verification_status,
          rating,
          total_reviews,
          profiles!inner (
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: { package }
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package'
    });
  }
});

// @route   POST /api/packages
// @desc    Create new package
// @access  Private (Agency)
router.post('/', authenticateToken, requireAgency, validate(schemas.createPackage), async (req, res) => {
  try {
    // Get user's agency
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (agencyError || !agency) {
      return res.status(400).json({
        success: false,
        message: 'Agency not found'
      });
    }

    const packageData = {
      ...req.body,
      agency_id: agency.id
    };

    const { data: package, error } = await supabaseAdmin
      .from('packages')
      .insert(packageData)
      .select(`
        *,
        categories (
          id,
          name,
          icon
        ),
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create package'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: { package }
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package'
    });
  }
});

// @route   PUT /api/packages/:id
// @desc    Update package
// @access  Private (Package owner or Admin)
router.put('/:id', authenticateToken, requirePackageOwnership, validate(schemas.updatePackage), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: package, error } = await supabaseAdmin
      .from('packages')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          icon
        ),
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update package'
      });
    }

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: { package }
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package'
    });
  }
});

// @route   DELETE /api/packages/:id
// @desc    Delete package
// @access  Private (Package owner or Admin)
router.delete('/:id', authenticateToken, requirePackageOwnership, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if package has any bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('package_id', id)
      .limit(1);

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to check package bookings'
      });
    }

    if (bookings && bookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete package with existing bookings'
      });
    }

    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete package'
      });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package'
    });
  }
});

// @route   PUT /api/packages/:id/status
// @desc    Update package status
// @access  Private (Package owner or Admin)
router.put('/:id/status', authenticateToken, requirePackageOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'active', 'inactive', 'pending_approval'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const { data: package, error } = await supabaseAdmin
      .from('packages')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          icon
        ),
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update package status'
      });
    }

    res.json({
      success: true,
      message: 'Package status updated successfully',
      data: { package }
    });
  } catch (error) {
    console.error('Update package status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package status'
    });
  }
});

// @route   PUT /api/packages/:id/featured
// @desc    Toggle package featured status (admin only)
// @access  Private (Admin)
router.put('/:id/featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Featured must be a boolean value'
      });
    }

    const { data: package, error } = await supabaseAdmin
      .from('packages')
      .update({
        featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          icon
        ),
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update package featured status'
      });
    }

    res.json({
      success: true,
      message: 'Package featured status updated successfully',
      data: { package }
    });
  } catch (error) {
    console.error('Update package featured status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package featured status'
    });
  }
});

// @route   GET /api/packages/:id/availability
// @desc    Get package availability
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    let query = supabaseAdmin
      .from('package_availability')
      .select('*')
      .eq('package_id', id)
      .gte('start_date', new Date().toISOString().split('T')[0]);

    if (start_date) {
      query = query.gte('start_date', start_date);
    }
    if (end_date) {
      query = query.lte('end_date', end_date);
    }

    query = query.order('start_date', { ascending: true });

    const { data: availability, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch package availability'
      });
    }

    res.json({
      success: true,
      data: { availability }
    });
  } catch (error) {
    console.error('Get package availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package availability'
    });
  }
});

// @route   POST /api/packages/:id/availability
// @desc    Add package availability
// @access  Private (Package owner or Admin)
router.post('/:id/availability', authenticateToken, requirePackageOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, available_spots, price_override } = req.body;

    if (!start_date || !end_date || !available_spots) {
      return res.status(400).json({
        success: false,
        message: 'Start date, end date, and available spots are required'
      });
    }

    const availabilityData = {
      package_id: id,
      start_date,
      end_date,
      available_spots: parseInt(available_spots),
      price_override: price_override ? parseFloat(price_override) : null
    };

    const { data: availability, error } = await supabaseAdmin
      .from('package_availability')
      .insert(availabilityData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to add package availability'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Package availability added successfully',
      data: { availability }
    });
  } catch (error) {
    console.error('Add package availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add package availability'
    });
  }
});

// @route   GET /api/packages/:id/reviews
// @desc    Get package reviews
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
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('package_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch package reviews'
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
    console.error('Get package reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package reviews'
    });
  }
});

// @route   GET /api/packages/my
// @desc    Get current user's packages (for agencies)
// @access  Private (Agency)
router.get('/my', authenticateToken, requireAgency, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'active',
      sort = 'created_at',
      order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Get user's agency
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (agencyError || !agency) {
      return res.status(400).json({
        success: false,
        message: 'Agency not found'
      });
    }

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
      .eq('agency_id', agency.id);

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: packages, error, count } = await query;

    if (error) {
      console.error('Get my packages error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch packages'
      });
    }

    res.json({
      success: true,
      data: {
        packages: packages || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages'
    });
  }
});

// @route   GET /api/packages/debug/:agencyId
// @desc    Debug endpoint to check agency and package status
// @access  Public (for debugging)
router.get('/debug/:agencyId', async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Get agency details
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          username
        )
      `)
      .eq('id', agencyId)
      .single();

    if (agencyError) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Get agency packages
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select(`
        id,
        name,
        status,
        created_at,
        updated_at
      `)
      .eq('agency_id', agencyId);

    if (packagesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch packages'
      });
    }

    res.json({
      success: true,
      data: {
        agency: {
          id: agency.id,
          agency_name: agency.agency_name,
          verification_status: agency.verification_status,
          created_at: agency.created_at
        },
        packages: packages || [],
        package_count: packages?.length || 0
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint failed'
    });
  }
});

module.exports = router;
