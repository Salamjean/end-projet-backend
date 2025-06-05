const express = require('express');
const router = express.Router();

// Route de santé pour vérifier si l'API est disponible
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

module.exports = router; 