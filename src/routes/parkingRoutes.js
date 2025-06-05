const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, isAdmin } = require('../middleware/auth');
const {
  createParking,
  getAllParkings,
  getParkingById,
  updateParking,
  deleteParking
} = require('../controllers/parkingController');

// Configuration de multer pour le stockage des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.resolve(__dirname, '..', '..', 'public', 'uploads');
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Le fichier doit être une image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Routes publiques
router.get('/', getAllParkings);
router.get('/:id', getParkingById);

// Routes protégées (admin uniquement)
router.post('/', auth, isAdmin, upload.single('image'), createParking);
router.patch('/:id', auth, isAdmin, upload.single('image'), updateParking);
router.delete('/:id', auth, isAdmin, deleteParking);

module.exports = router; 