const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/books'); // Files will be saved in the 'uploads' directory
    },
    filename: function(req, file, cb) {
      // Create unique filename with original extension
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  
  // File filter function
  const fileFilter = (req, file, cb) => {
    // Accept only certain file types
    const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  };
  
  // Initialize multer with configuration
  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
  });

module.exports = upload;