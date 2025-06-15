const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Parking = require('../models/Parking');
const Reservation = require('../models/Reservation');

// Route pour obtenir les statistiques du dashboard
router.get('/stats', async (req, res) => {
  try {
    // Compter le nombre total de clients
    const totalClients = await Client.countDocuments();

    // Compter le nombre total de parkings
    const totalParkings = await Parking.countDocuments();

    // Compter le nombre total de réservations
    const totalReservations = await Reservation.countDocuments();

    // Calculer le revenu total
    const reservations = await Reservation.find({ status: 'confirmed' });
    const totalRevenue = reservations.reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);

    // Compter les réservations par statut
    const pendingReservations = await Reservation.countDocuments({ status: 'pending' });
    const confirmedReservations = await Reservation.countDocuments({ status: 'confirmed' });
    const cancelledReservations = await Reservation.countDocuments({ status: 'cancelled' });

    // Récupérer les activités récentes
    const recentActivities = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('parking', 'name');

    const formattedActivities = recentActivities.map(activity => ({
      id: activity._id,
      title: `Réservation #${activity._id.toString().slice(-4)} - ${activity.parking ? activity.parking.name : 'Parking inconnu'}`,
      date: activity.createdAt,
      status: activity.status
    }));

    res.json({
      clients: totalClients,
      parkings: totalParkings,
      reservations: totalReservations,
      revenue: totalRevenue,
      pending: pendingReservations,
      confirmed: confirmedReservations,
      cancelled: cancelledReservations,
      recentActivities: formattedActivities
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router; 