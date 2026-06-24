const express = require('express');
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/upload/image
// @desc    Upload single image to Supabase storage
// @access  Private
router.post('/image', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type } = req.body;
    const file = req.file;
    
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Determine bucket based on type
    let bucketName;
    switch (type) {
      case 'package':
        bucketName = 'package-images';
        break;
      case 'profile':
        bucketName = 'profile-images';
        break;
      case 'agency':
        bucketName = 'agency-images';
        break;
      default:
        bucketName = 'general-images';
    }

    // Upload to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to storage'
      });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileName: fileName,
        url: urlData.publicUrl,
        size: file.size,
        type: file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images to Supabase storage
// @access  Private
router.post('/images', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { type } = req.body;
    const files = req.files;
    
    // Determine bucket based on type
    let bucketName;
    switch (type) {
      case 'package':
        bucketName = 'package-images';
        break;
      case 'gallery':
        bucketName = 'gallery-images';
        break;
      default:
        bucketName = 'general-images';
    }

    const uploadPromises = files.map(async (file) => {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        fileName: fileName,
        url: urlData.publicUrl,
        size: file.size,
        type: file.mimetype,
        originalName: file.originalname
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: results,
        count: results.length
      }
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
});

// @route   DELETE /api/upload/image
// @desc    Delete image from Supabase storage
// @access  Private
router.delete('/image', authenticateToken, async (req, res) => {
  try {
    const { fileName, type } = req.body;
    
    if (!fileName || !type) {
      return res.status(400).json({
        success: false,
        message: 'File name and type are required'
      });
    }

    // Determine bucket based on type
    let bucketName;
    switch (type) {
      case 'package':
        bucketName = 'package-images';
        break;
      case 'profile':
        bucketName = 'profile-images';
        break;
      case 'agency':
        bucketName = 'agency-images';
        break;
      default:
        bucketName = 'general-images';
    }

    // Delete from Supabase storage
    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file from storage'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// @route   GET /api/upload/test
// @desc    Test bucket access and permissions
// @access  Private
router.get('/test', authenticateToken, async (req, res) => {
  try {
    const bucketName = 'package-images';
    
    // Test bucket access
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to list buckets',
        error: listError.message
      });
    }

    const targetBucket = buckets.find(bucket => bucket.name === bucketName);
    
    if (!targetBucket) {
      return res.status(404).json({
        success: false,
        message: `Bucket '${bucketName}' not found`,
        availableBuckets: buckets.map(b => b.name)
      });
    }

    // Test file listing
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from(bucketName)
      .list('', { limit: 5 });

    if (filesError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to list files in bucket',
        error: filesError.message
      });
    }

    res.json({
      success: true,
      message: 'Bucket access test successful',
      data: {
        bucketName,
        bucketExists: true,
        bucketPublic: targetBucket.public,
        fileCount: files ? files.length : 0,
        sampleFiles: files ? files.slice(0, 3) : []
      }
    });
  } catch (error) {
    console.error('Bucket test error:', error);
    res.status(500).json({
      success: false,
      message: 'Bucket test failed',
      error: error.message
    });
  }
});

// @route   POST /api/upload/setup-bucket
// @desc    Setup bucket with proper permissions
// @access  Private
router.post('/setup-bucket', authenticateToken, async (req, res) => {
  try {
    const bucketName = 'package-images';
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to list buckets',
        error: listError.message
      });
    }

    const targetBucket = buckets.find(bucket => bucket.name === bucketName);
    
    if (!targetBucket) {
      // Create bucket if it doesn't exist
      const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create bucket',
          error: createError.message
        });
      }

      return res.json({
        success: true,
        message: 'Bucket created successfully',
        data: {
          bucketName,
          public: true,
          action: 'created'
        }
      });
    } else {
      // Update bucket to be public if it's not
      if (!targetBucket.public) {
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
          public: true
        });

        if (updateError) {
          return res.status(500).json({
            success: false,
            message: 'Failed to update bucket permissions',
            error: updateError.message
          });
        }

        return res.json({
          success: true,
          message: 'Bucket permissions updated successfully',
          data: {
            bucketName,
            public: true,
            action: 'updated'
          }
        });
      } else {
        return res.json({
          success: true,
          message: 'Bucket is already properly configured',
          data: {
            bucketName,
            public: true,
            action: 'no_change_needed'
          }
        });
      }
    }
  } catch (error) {
    console.error('Bucket setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Bucket setup failed',
      error: error.message
    });
  }
});

module.exports = router;
