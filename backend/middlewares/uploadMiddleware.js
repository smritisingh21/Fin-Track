const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists to prevent 500 errors
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, 
        { recursive: true });
}

// Configure storage logic
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Using the verified absolute path
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Create a URL-friendly unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanFileName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${uniqueSuffix}-${cleanFileName}`);
    },
});

// Define file filter to restrict types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Passing an error to the callback can trigger a 500 if not handled
        cb(new Error('INVALID_FILE_TYPE'), false);
    }
};

// Initialize multer
const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 2 } // 2MB Limit
});

module.exports = upload;