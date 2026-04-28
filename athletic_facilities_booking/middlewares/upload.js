const multer = require('multer');
const path = require('path');

// Storage Settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // που αποθηκεύουμε
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // μοναδικό όνομα
    }
});

// File Filter (προαιρετικό - μόνο εικόνες)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
});

module.exports = upload;
