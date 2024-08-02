const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directorio donde se almacenarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use original filename
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Limite 5GB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('file'); // Expecting a single file input named 'file'

// Tipo de archivo
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf|gif|txt|xlsx|xls|zip|doc|docx|ppt|pptx|odt|rar|7z|tar|gz/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.originalname);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Ese tipo de archivo no está permitido!.');
  }
}

module.exports = upload;


