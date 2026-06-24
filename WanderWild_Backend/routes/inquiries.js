const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireCustomer, requireAgency, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/inquiries
// @desc    Get all inquiries (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      agency_id,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('inquiries')
      .select(`
        *,
        profiles!inquiries_customer_id_fkey (
          id,
          full_name,
          username,
          email
        ),
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        ),
        packages (
          id,
          name,
          location
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (agency_id) {
      query = query.eq('agency_id', agency_id);
    }
    if (search) {
      query = query.or(`subject.ilike.%${search}%,message.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: inquiries, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch inquiries'
      });
    }

    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries'
    });
  }
});

// @route   GET /api/inquiries/my
// @desc    Get current user's inquiries
// @access  Private (Customer)
router.get('/my', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('inquiries')
      .select(`
        *,
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        ),
        packages (
          id,
          name,
          location
        )
      `, { count: 'exact' })
      .eq('customer_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: inquiries, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch inquiries'
      });
    }

    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries'
    });
  }
});

// @route   GET /api/inquiries/agency
// @desc    Get inquiries for agency
// @access  Private (Agency)
router.get('/agency', authenticateToken, requireAgency, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Get user's agency
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (agencyError || !agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    let query = supabaseAdmin
      .from('inquiries')
      .select(`
        *,
        profiles!inquiries_customer_id_fkey (
          id,
          full_name,
          username,
          email
        ),
        packages (
          id,
          name,
          location
        )
      `, { count: 'exact' })
      .eq('agency_id', agency.id);

    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: inquiries, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch inquiries'
      });
    }

    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get agency inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries'
    });
  }
});

// @route   GET /api/inquiries/:id
// @desc    Get inquiry by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: inquiry, error } = await supabaseAdmin
      .from('inquiries')
      .select(`
        *,
        profiles!inquiries_customer_id_fkey (
          id,
          full_name,
          username,
          email,
          phone
        ),
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username,
            email
          )
        ),
        packages (
          id,
          name,
          location
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if user can access this inquiry
    const canAccess = req.user.role === 'admin' || 
                     inquiry.customer_id === req.user.id ||
                     inquiry.agencies.user_id === req.user.id;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { inquiry }
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry'
    });
  }
});

// @route   POST /api/inquiries
// @desc    Create new inquiry
// @access  Private (Customer)
router.post('/', authenticateToken, requireCustomer, validate(schemas.createInquiry), async (req, res) => {
  try {
    const { agency_id, package_id, subject, message, priority } = req.body;

    // Verify agency exists and is verified
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .select('id, verification_status')
      .eq('id', agency_id)
      .single();

    if (agencyError || !agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    if (agency.verification_status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send inquiries to unverified agencies'
      });
    }

    // Verify package belongs to agency if package_id is provided
    if (package_id) {
      const { data: package, error: packageError } = await supabaseAdmin
        .from('packages')
        .select('id, agency_id')
        .eq('id', package_id)
        .eq('agency_id', agency_id)
        .single();

      if (packageError || !package) {
        return res.status(400).json({
          success: false,
          message: 'Package not found or does not belong to the specified agency'
        });
      }
    }

    const inquiryData = {
      customer_id: req.user.id,
      agency_id,
      package_id: package_id || null,
      subject,
      message,
      priority: priority || 'normal',
      status: 'open'
    };

    const { data: inquiry, error } = await supabaseAdmin
      .from('inquiries')
      .insert(inquiryData)
      .select(`
        *,
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        ),
        packages (
          id,
          name,
          location
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create inquiry'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inquiry'
    });
  }
});

// @route   PUT /api/inquiries/:id/status
// @desc    Update inquiry status
// @access  Private (Agency or Admin)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Get inquiry details
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from('inquiries')
      .select(`
        *,
        agencies!inner (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (inquiryError || !inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' || 
                     inquiry.agencies.user_id === req.user.id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update inquiry status'
      });
    }

    // Update inquiry status
    const { data: updatedInquiry, error: updateError } = await supabaseAdmin
      .from('inquiries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        profiles!inquiries_customer_id_fkey (
          id,
          full_name,
          username,
          email
        ),
        agencies!inner (
          id,
          agency_name,
          profiles!inner (
            id,
            full_name,
            username
          )
        ),
        packages (
          id,
          name,
          location
        )
      `)
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update inquiry status'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: { inquiry: updatedInquiry }
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status'
    });
  }
});

// @route   GET /api/inquiries/:id/messages
// @desc    Get inquiry messages
// @access  Private
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user can access this inquiry
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from('inquiries')
      .select(`
        customer_id,
        agencies!inner (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (inquiryError || !inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const canAccess = req.user.role === 'admin' || 
                     inquiry.customer_id === req.user.id ||
                     inquiry.agencies.user_id === req.user.id;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { data: messages, error, count } = await supabaseAdmin
      .from('inquiry_messages')
      .select(`
        *,
        profiles!inquiry_messages_sender_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('inquiry_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inquiry messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   POST /api/inquiries/:id/messages
// @desc    Send message in inquiry
// @access  Private
router.post('/:id/messages', authenticateToken, validate(schemas.createInquiryMessage), async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;

    // Check if user can access this inquiry
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from('inquiries')
      .select(`
        customer_id,
        agencies!inner (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (inquiryError || !inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const canAccess = req.user.role === 'admin' || 
                     inquiry.customer_id === req.user.id ||
                     inquiry.agencies.user_id === req.user.id;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create message
    const messageData = {
      inquiry_id: id,
      sender_id: req.user.id,
      message,
      attachments: attachments || [],
      is_read: false
    };

    const { data: newMessage, error } = await supabaseAdmin
      .from('inquiry_messages')
      .insert(messageData)
      .select(`
        *,
        profiles!inquiry_messages_sender_id_fkey (
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
        message: 'Failed to send message'
      });
    }

    // Update inquiry status to replied if agency is responding
    if (inquiry.agencies.user_id === req.user.id) {
      await supabaseAdmin
        .from('inquiries')
        .update({
          status: 'replied',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage }
    });
  } catch (error) {
    console.error('Send inquiry message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   PUT /api/inquiries/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('inquiry_messages')
      .select(`
        id,
        inquiry_id,
        sender_id,
        inquiries!inner (
          customer_id,
          agencies!inner (
            user_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (messageError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const canAccess = req.user.role === 'admin' || 
                     message.inquiries.customer_id === req.user.id ||
                     message.inquiries.agencies.user_id === req.user.id;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't mark own messages as read
    if (message.sender_id === req.user.id) {
      return res.json({
        success: true,
        message: 'Message is your own'
      });
    }

    // Mark message as read
    const { error } = await supabaseAdmin
      .from('inquiry_messages')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to mark message as read'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

module.exports = router;
