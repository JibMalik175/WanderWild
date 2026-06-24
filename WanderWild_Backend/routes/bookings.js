const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAgency, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sort = 'created_at',
      order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (
          id,
          name,
          price,
          location
        ),
        profiles!inner (
          id,
          full_name,
          username,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Get bookings error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch bookings'
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
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Private
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sort = 'created_at',
      order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (
          id,
          name,
          price,
          location,
          duration_days,
          images
        )
      `, { count: 'exact' })
      .eq('user_id', req.user.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Get my bookings error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch bookings'
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
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// @route   GET /api/bookings/agency
// @desc    Get bookings for agency's packages
// @access  Private (Agency)
router.get('/agency', authenticateToken, requireAgency, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
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
      .from('bookings')
      .select(`
        *,
        packages!inner (
          id,
          name,
          price,
          location,
          agency_id
        ),
        profiles!inner (
          id,
          full_name,
          username,
          email,
          phone
        )
      `, { count: 'exact' })
      .eq('packages.agency_id', agency.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Get agency bookings error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch bookings'
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
    console.error('Get agency bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (
          id,
          name,
          price,
          location,
          duration_days,
          images,
          agencies (
            id,
            agency_name,
            email,
            phone
          )
        ),
        profiles!inner (
          id,
          full_name,
          username,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const { data: agency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const isOwner = booking.user_id === req.user.id;
    const isAgency = agency && booking.packages?.agencies?.id === agency.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAgency && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      package_id,
      booking_date,
      number_of_people,
      special_requests,
      contact_email,
      contact_phone
    } = req.body;

    // Validate required fields
    if (!package_id || !booking_date || !number_of_people) {
      return res.status(400).json({
        success: false,
        message: 'Package ID, booking date, and number of people are required'
      });
    }

    // Get package details
    const { data: package, error: packageError } = await supabaseAdmin
      .from('packages')
      .select('id, name, price, status')
      .eq('id', package_id)
      .single();

    if (packageError || !package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    if (package.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Package is not available for booking'
      });
    }

    // Calculate total price
    const total_price = package.price * number_of_people;

    const bookingData = {
      user_id: req.user.id,
      package_id,
      booking_date,
      number_of_people: parseInt(number_of_people),
      total_price,
      special_requests,
      contact_email: contact_email || req.user.email,
      contact_phone,
      status: 'pending',
      payment_status: 'pending'
    };

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select(`
        *,
        packages (
          id,
          name,
          price,
          location,
          duration_days
        )
      `)
      .single();

    if (error) {
      console.error('Create booking error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to create booking'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Agency or Admin)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages!inner (
          agency_id
        )
      `)
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const { data: agency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const isAgency = agency && booking.packages.agency_id === agency.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAgency && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    const { data: updatedBooking, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        packages (
          id,
          name,
          price,
          location
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update booking status'
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private (Booking owner)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    const { data: updatedBooking, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        packages (
          id,
          name,
          price,
          location
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete booking'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking'
    });
  }
});

module.exports = router;

