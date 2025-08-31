const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { AppError } = require('./error');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type
    let folder = 'chat/files';
    if (file.mimetype.startsWith('image/')) {
      folder = 'chat/images';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'chat/videos';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mov'],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      resource_type: 'auto'
    };
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'video/quicktime'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images, PDFs, documents, and videos are allowed', 400), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Maximum 1 file per request
  }
});

// Single file upload middleware
const uploadSingle = upload.single('file');

// Handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 10MB', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected field name. Use "file" as field name', 400));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }
  next(err);
};

// Wrapper function to handle upload with error handling
const uploadFile = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Get file info from URL
const getFileInfoFromUrl = (url) => {
  try {
    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    return { publicId };
  } catch (error) {
    console.error('Error parsing file URL:', error);
    return null;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileInfoFromUrl,
  cloudinary
};