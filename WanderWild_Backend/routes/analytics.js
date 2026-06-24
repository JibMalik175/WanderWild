const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAdmin, requireAgency } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/public-stats
// @desc    Get public platform statistics
// @access  Public
router.get('/public-stats', async (req, res) => {
  try {
    // Get basic public stats without sensitive information
    const [usersResult, packagesResult, agenciesResult] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),
      supabaseAdmin
        .from('packages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabaseAdmin
        .from('agencies')
        .select('id', { count: 'exact', head: true })
        .eq('verification_status', 'verified')
    ]);

    const totalUsers = usersResult.count || 0;
    const totalPackages = packagesResult.count || 0;
    const totalAgencies = agenciesResult.count || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPackages,
        totalAgencies,
        totalBookings: 0 // This would require more complex query, keeping simple for now
      }
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public statistics'
    });
  }
});

// @route   GET /api/analytics/overview
// @desc    Get platform overview analytics (admin only)
// @access  Private (Admin)
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get user statistics
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, status, created_at');

    if (usersError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }

    // Get package statistics
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select('id, status, created_at, price, rating');

    if (packagesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch package statistics'
      });
    }

    // Get booking statistics
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, status, total_amount, commission_amount, created_at');

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch booking statistics'
      });
    }

    // Get agency statistics
    const { data: agencies, error: agenciesError } = await supabaseAdmin
      .from('agencies')
      .select('id, verification_status, created_at');

    if (agenciesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch agency statistics'
      });
    }

    // Calculate overview statistics
    const totalUsers = users.length;
    const newUsers = users.filter(user => new Date(user.created_at) >= startDate).length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const userRoleDistribution = {
      customer: users.filter(user => user.role === 'customer').length,
      agency: users.filter(user => user.role === 'agency').length,
      admin: users.filter(user => user.role === 'admin').length
    };

    const totalPackages = packages.length;
    const activePackages = packages.filter(pkg => pkg.status === 'active').length;
    const newPackages = packages.filter(pkg => new Date(pkg.created_at) >= startDate).length;
    const averagePackageRating = packages.length > 0 
      ? packages.reduce((sum, pkg) => sum + (pkg.rating || 0), 0) / packages.length 
      : 0;

    const totalBookings = bookings.length;
    const newBookings = bookings.filter(booking => new Date(booking.created_at) >= startDate).length;
    const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
    const totalCommission = bookings.reduce((sum, booking) => sum + parseFloat(booking.commission_amount), 0);

    const totalAgencies = agencies.length;
    const verifiedAgencies = agencies.filter(agency => agency.verification_status === 'verified').length;
    const newAgencies = agencies.filter(agency => new Date(agency.created_at) >= startDate).length;

    const overview = {
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        roleDistribution: userRoleDistribution
      },
      packages: {
        total: totalPackages,
        active: activePackages,
        new: newPackages,
        averageRating: Math.round(averagePackageRating * 10) / 10
      },
      bookings: {
        total: totalBookings,
        new: newBookings,
        completed: completedBookings,
        totalRevenue,
        totalCommission
      },
      agencies: {
        total: totalAgencies,
        verified: verifiedAgencies,
        new: newAgencies
      },
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    };

    res.json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    console.error('Get overview analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview analytics'
    });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics (admin only)
// @access  Private (Admin)
router.get('/revenue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get booking data
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('total_amount, commission_amount, created_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch revenue data'
      });
    }

    // Calculate revenue metrics
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
    const totalCommission = bookings.reduce((sum, booking) => sum + parseFloat(booking.commission_amount), 0);
    const completedRevenue = bookings
      .filter(booking => booking.status === 'completed')
      .reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
    const completedCommission = bookings
      .filter(booking => booking.status === 'completed')
      .reduce((sum, booking) => sum + parseFloat(booking.commission_amount), 0);

    // Group revenue by time period
    const revenueByPeriod = {};
    bookings.forEach(booking => {
      const date = new Date(booking.created_at);
      let key;
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!revenueByPeriod[key]) {
        revenueByPeriod[key] = {
          revenue: 0,
          commission: 0,
          bookings: 0
        };
      }
      
      revenueByPeriod[key].revenue += parseFloat(booking.total_amount);
      revenueByPeriod[key].commission += parseFloat(booking.commission_amount);
      revenueByPeriod[key].bookings += 1;
    });

    // Convert to array and sort
    const revenueChart = Object.entries(revenueByPeriod)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        commission: data.commission,
        bookings: data.bookings
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const revenue = {
      total: totalRevenue,
      commission: totalCommission,
      completed: completedRevenue,
      completedCommission,
      chart: revenueChart,
      period,
      groupBy
    };

    res.json({
      success: true,
      data: { revenue }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics'
    });
  }
});

// @route   GET /api/analytics/packages
// @desc    Get package analytics
// @access  Private (Admin or Agency)
router.get('/packages', authenticateToken, async (req, res) => {
  try {
    const { period = '30d', agency_id } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    let packageQuery = supabaseAdmin
      .from('packages')
      .select(`
        id,
        name,
        status,
        price,
        rating,
        total_reviews,
        created_at,
        agencies!inner (
          id,
          agency_name,
          user_id
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Filter by agency if specified or if user is agency
    if (agency_id) {
      packageQuery = packageQuery.eq('agency_id', agency_id);
    } else if (req.user.role === 'agency') {
      // Get user's agency
      const { data: agency } = await supabaseAdmin
        .from('agencies')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (agency) {
        packageQuery = packageQuery.eq('agency_id', agency.id);
      }
    }

    const { data: packages, error: packagesError } = await packageQuery;

    if (packagesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch package analytics'
      });
    }

    // Get booking data for packages
    const packageIds = packages.map(pkg => pkg.id);
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('package_id, total_amount, status, created_at')
      .in('package_id', packageIds);

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch booking data'
      });
    }

    // Calculate package analytics
    const totalPackages = packages.length;
    const activePackages = packages.filter(pkg => pkg.status === 'active').length;
    const averageRating = packages.length > 0 
      ? packages.reduce((sum, pkg) => sum + (pkg.rating || 0), 0) / packages.length 
      : 0;

    // Top performing packages
    const packagePerformance = packages.map(pkg => {
      const packageBookings = bookings.filter(booking => booking.package_id === pkg.id);
      const totalBookings = packageBookings.length;
      const totalRevenue = packageBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
      
      return {
        id: pkg.id,
        name: pkg.name,
        agency: pkg.agencies.agency_name,
        price: pkg.price,
        rating: pkg.rating,
        totalReviews: pkg.total_reviews,
        totalBookings,
        totalRevenue
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Category distribution
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch category data'
      });
    }

    const categoryDistribution = {};
    packages.forEach(pkg => {
      // This would need to be adjusted based on your actual category relationship
      categoryDistribution['General'] = (categoryDistribution['General'] || 0) + 1;
    });

    const packageAnalytics = {
      total: totalPackages,
      active: activePackages,
      averageRating: Math.round(averageRating * 10) / 10,
      topPerforming: packagePerformance.slice(0, 10),
      categoryDistribution,
      period
    };

    res.json({
      success: true,
      data: { packages: packageAnalytics }
    });
  } catch (error) {
    console.error('Get package analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package analytics'
    });
  }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics (admin only)
// @access  Private (Admin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get user data
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, status, created_at, full_name, username');

    if (usersError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch user data'
      });
    }

    // Get booking data for user activity
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('customer_id, total_amount, created_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch booking data'
      });
    }

    // Calculate user analytics
    const totalUsers = users.length;
    const newUsers = users.filter(user => new Date(user.created_at) >= startDate).length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const suspendedUsers = users.filter(user => user.status === 'suspended').length;

    const roleDistribution = {
      customer: users.filter(user => user.role === 'customer').length,
      agency: users.filter(user => user.role === 'agency').length,
      admin: users.filter(user => user.role === 'admin').length
    };

    // User activity (users who made bookings)
    const activeUserIds = [...new Set(bookings.map(booking => booking.customer_id))];
    const userActivity = activeUserIds.length;

    // Top customers by spending
    const customerSpending = {};
    bookings.forEach(booking => {
      if (!customerSpending[booking.customer_id]) {
        customerSpending[booking.customer_id] = {
          totalSpent: 0,
          totalBookings: 0
        };
      }
      customerSpending[booking.customer_id].totalSpent += parseFloat(booking.total_amount);
      customerSpending[booking.customer_id].totalBookings += 1;
    });

    const topCustomers = Object.entries(customerSpending)
      .map(([userId, data]) => {
        const user = users.find(u => u.id === userId);
        return {
          id: userId,
          name: user ? user.full_name : 'Unknown',
          username: user ? user.username : 'Unknown',
          totalSpent: data.totalSpent,
          totalBookings: data.totalBookings
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const userAnalytics = {
      total: totalUsers,
      new: newUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      roleDistribution,
      userActivity,
      topCustomers,
      period
    };

    res.json({
      success: true,
      data: { users: userAnalytics }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

// @route   GET /api/analytics/agencies
// @desc    Get agency analytics (admin only)
// @access  Private (Admin)
router.get('/agencies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get agency data
    const { data: agencies, error: agenciesError } = await supabaseAdmin
      .from('agencies')
      .select(`
        id,
        agency_name,
        verification_status,
        rating,
        total_reviews,
        created_at,
        profiles!inner (
          id,
          full_name,
          username
        )
      `);

    if (agenciesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch agency data'
      });
    }

    // Get package data for agencies
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select('agency_id, status, price, rating, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (packagesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch package data'
      });
    }

    // Get booking data for agencies
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        total_amount,
        commission_amount,
        created_at,
        packages!inner (
          agency_id
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch booking data'
      });
    }

    // Calculate agency analytics
    const totalAgencies = agencies.length;
    const verifiedAgencies = agencies.filter(agency => agency.verification_status === 'verified').length;
    const newAgencies = agencies.filter(agency => new Date(agency.created_at) >= startDate).length;

    const verificationDistribution = {
      verified: agencies.filter(agency => agency.verification_status === 'verified').length,
      pending: agencies.filter(agency => agency.verification_status === 'pending').length,
      rejected: agencies.filter(agency => agency.verification_status === 'rejected').length
    };

    // Top performing agencies
    const agencyPerformance = agencies.map(agency => {
      const agencyPackages = packages.filter(pkg => pkg.agency_id === agency.id);
      const agencyBookings = bookings.filter(booking => booking.packages.agency_id === agency.id);
      
      const totalPackages = agencyPackages.length;
      const activePackages = agencyPackages.filter(pkg => pkg.status === 'active').length;
      const totalBookings = agencyBookings.length;
      const totalRevenue = agencyBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
      const totalCommission = agencyBookings.reduce((sum, booking) => sum + parseFloat(booking.commission_amount), 0);
      
      return {
        id: agency.id,
        name: agency.agency_name,
        owner: agency.profiles.full_name,
        verificationStatus: agency.verification_status,
        rating: agency.rating,
        totalReviews: agency.total_reviews,
        totalPackages,
        activePackages,
        totalBookings,
        totalRevenue,
        totalCommission
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const agencyAnalytics = {
      total: totalAgencies,
      verified: verifiedAgencies,
      new: newAgencies,
      verificationDistribution,
      topPerforming: agencyPerformance.slice(0, 10),
      period
    };

    res.json({
      success: true,
      data: { agencies: agencyAnalytics }
    });
  } catch (error) {
    console.error('Get agency analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency analytics'
    });
  }
});

// @route   GET /api/analytics/user-growth
// @desc    Get user growth data over time (admin only)
// @access  Private (Admin)
router.get('/user-growth', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    // Get all users with their creation dates
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, created_at, role');

    if (usersError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch user data'
      });
    }

    // Get all packages with their creation dates
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select('id, created_at, status');

    if (packagesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch package data'
      });
    }

    // Get all bookings with their creation dates
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, created_at, total_price');

    if (bookingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch booking data'
      });
    }

    // Generate monthly data for the specified number of months
    const monthlyData = [];
    const now = new Date();
    
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      
      // Count users created in this month
      const usersInMonth = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= date && userDate < nextDate;
      }).length;

      // Count total users up to this month
      const totalUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate < nextDate;
      }).length;

      // Count packages created in this month
      const packagesInMonth = packages.filter(pkg => {
        const pkgDate = new Date(pkg.created_at);
        return pkgDate >= date && pkgDate < nextDate;
      }).length;

      // Count total packages up to this month
      const totalPackages = packages.filter(pkg => {
        const pkgDate = new Date(pkg.created_at);
        return pkgDate < nextDate;
      }).length;

      // Count bookings in this month
      const bookingsInMonth = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= date && bookingDate < nextDate;
      }).length;

      // Calculate revenue for this month
      const revenueInMonth = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= date && bookingDate < nextDate;
        })
        .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);

      monthlyData.push({
        month: monthName,
        year: date.getFullYear(),
        date: date.toISOString(),
        users: totalUsers,
        newUsers: usersInMonth,
        packages: totalPackages,
        newPackages: packagesInMonth,
        bookings: bookingsInMonth,
        revenue: Math.round(revenueInMonth)
      });
    }

    res.json({
      success: true,
      data: {
        monthlyData,
        period: `${months} months`
      }
    });
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user growth data'
    });
  }
});

// @route   POST /api/analytics/events
// @desc    Track analytics event
// @access  Private
router.post('/events', authenticateToken, async (req, res) => {
  try {
    const { event_type, event_data, page_url, user_agent } = req.body;

    if (!event_type) {
      return res.status(400).json({
        success: false,
        message: 'Event type is required'
      });
    }

    const eventData = {
      user_id: req.user.id,
      event_type,
      event_data: event_data || {},
      page_url: page_url || null,
      user_agent: user_agent || null,
      ip_address: req.ip || null
    };

    const { data: event, error } = await supabaseAdmin
      .from('analytics_events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to track event'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Track analytics event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
});

module.exports = router;
