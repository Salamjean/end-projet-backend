const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const parkingRoutes = require('./parkingRoutes');
const reservationRoutes = require('./reservationRoutes');
const clientRoutes = require('./clientRoutes');

router.use('/auth', authRoutes);
router.use('/parkings', parkingRoutes);
router.use('/reservations', reservationRoutes);
router.use('/clients', clientRoutes);

module.exports = router; 