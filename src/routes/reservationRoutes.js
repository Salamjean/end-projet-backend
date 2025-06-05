const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    createReservation,
    getUserReservations,
    getReservation,
    cancelReservation,
    getPendingReservations,
    confirmReservation,
    rejectReservation,
    getAllReservations,
    deleteReservation
} = require('../controllers/reservationController');

// Routes publiques
router.post('/', createReservation);
router.get('/user', getUserReservations);
router.get('/:id', getReservation);
router.put('/:id/cancel', cancelReservation);

// Routes admin
router.get('/admin/pending', auth, isAdmin, getPendingReservations);
router.get('/admin/all', auth, isAdmin, getAllReservations);
router.put('/admin/:id/confirm', auth, isAdmin, confirmReservation);
router.put('/admin/:id/reject', auth, isAdmin, rejectReservation);
router.delete('/admin/:id', auth, isAdmin, deleteReservation);

module.exports = router; 