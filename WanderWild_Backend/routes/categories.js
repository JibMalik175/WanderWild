const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: categories, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin)
router.post('/', authenticateToken, requireAdmin, validate(schemas.createCategory), async (req, res) => {
  try {
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create category'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin)
router.put('/:id', authenticateToken, requireAdmin, validate(schemas.createCategory), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update category'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has any packages
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (packagesError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to check category packages'
      });
    }

    if (packages && packages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing packages'
      });
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete category'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

// @route   GET /api/categories/:id/packages
// @desc    Get packages by category
// @access  Public
router.get('/:id/packages', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'active' } = req.query;
    const offset = (page - 1) * limit;

    const { data: packages, error, count } = await supabaseAdmin
      .from('packages')
      .select(`
        *,
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
      `, { count: 'exact' })
      .eq('category_id', id)
      .eq('status', status)
      .eq('agencies.verification_status', 'verified')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch category packages'
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
    console.error('Get category packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category packages'
    });
  }
});

module.exports = router;
