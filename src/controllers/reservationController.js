const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');
const { sendConfirmationEmail, sendCancellationEmail } = require('../services/emailService');

// Créer une nouvelle réservation
const createReservation = async (req, res) => {
    try {
        console.log('Données reçues complètes:', JSON.stringify(req.body, null, 2));
        const { 
            parkingId, 
            firstName, 
            lastName, 
            email, 
            phone, 
            vehiclePlate, 
            vehicleModel,
            startDate, 
            endDate, 
            total,
            duration 
        } = req.body;

        // Validation des données avec messages détaillés
        const missingFields = [];
        if (!parkingId) missingFields.push('parkingId');
        if (!firstName) missingFields.push('firstName');
        if (!lastName) missingFields.push('lastName');
        if (!email) missingFields.push('email');
        if (!phone) missingFields.push('phone');
        if (!vehiclePlate) missingFields.push('vehiclePlate');
        if (!vehicleModel) missingFields.push('vehicleModel');
        if (!startDate) missingFields.push('startDate');
        if (!endDate) missingFields.push('endDate');
        if (!total) missingFields.push('total');
        if (!duration) missingFields.push('duration');

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Champs manquants',
                missingFields: missingFields
            });
        }

        // Vérifier si le parking existe
        const parkingExists = await Parking.findById(parkingId);
        if (!parkingExists) {
            return res.status(404).json({ message: 'Parking non trouvé' });
        }

        // Vérifier si le parking est disponible pour ces dates
        const existingReservation = await Reservation.findOne({
            parking: parkingId,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ]
        });

        if (existingReservation) {
            return res.status(400).json({ 
                message: 'Le parking n\'est pas disponible pour ces dates' 
            });
        }

        // Créer la réservation
        const reservation = new Reservation({
            name: `${firstName} ${lastName}`,
            email,
            phone,
            parking: parkingId,
            vehiclePlate,
            vehicleModel,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalPrice: parseFloat(total),
            duration,
            status: 'pending'
        });

        // Sauvegarder la réservation
        const savedReservation = await reservation.save();
        console.log('Réservation créée avec succès:', savedReservation);

        // Populer les détails du parking pour la réponse
        await savedReservation.populate('parking');
        
        res.status(201).json({
            message: 'Réservation créée avec succès',
            reservation: savedReservation
        });
    } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la création de la réservation',
            error: error.message 
        });
    }
};

// Obtenir toutes les réservations d'un utilisateur
const getUserReservations = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email requis' });
        }

        const reservations = await Reservation.find({ email })
            .populate('parking')
            .sort({ createdAt: -1 });
        
        res.json({
            message: 'Réservations récupérées avec succès',
            reservations
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des réservations',
            error: error.message 
        });
    }
};

// Obtenir une réservation spécifique
const getReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('parking');
        
        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }

        res.json({
            message: 'Réservation récupérée avec succès',
            reservation
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la réservation:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération de la réservation',
            error: error.message 
        });
    }
};

// Annuler une réservation
const cancelReservation = async (req, res) => {
    try {
        const { email } = req.body;
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }

        // Vérifier si l'email correspond à celui de la réservation
        if (reservation.email !== email) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        // Vérifier si la réservation peut être annulée
        if (reservation.status === 'cancelled') {
            return res.status(400).json({ message: 'Cette réservation est déjà annulée' });
        }

        reservation.status = 'cancelled';
        await reservation.save();
        
        res.json({ 
            message: 'Réservation annulée avec succès',
            reservation 
        });
    } catch (error) {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        res.status(500).json({ 
            message: 'Erreur lors de l\'annulation de la réservation',
            error: error.message 
        });
    }
};

// Obtenir toutes les réservations en attente (Admin)
const getPendingReservations = async (req, res) => {
    try {
        const pendingReservations = await Reservation.find({ status: 'pending' })
            .populate('parking')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Réservations en attente récupérées avec succès',
            reservations: pendingReservations
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations en attente:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des réservations en attente',
            error: error.message
        });
    }
};

// Confirmer une réservation (Admin)
const confirmReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('parking');

        if (!reservation) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }

        if (reservation.status !== 'pending') {
            return res.status(400).json({ error: 'Cette réservation ne peut pas être confirmée' });
        }

        reservation.status = 'confirmed';
        await reservation.save();

        // Envoyer l'email de confirmation
        try {
            await sendConfirmationEmail(reservation);
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // On continue même si l'envoi d'email échoue
        }

        res.json({ message: 'Réservation confirmée avec succès', reservation });
    } catch (error) {
        console.error('Erreur lors de la confirmation de la réservation:', error);
        res.status(500).json({ error: 'Erreur lors de la confirmation de la réservation' });
    }
};

// Rejeter une réservation (Admin)
const rejectReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('parking');

        if (!reservation) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }

        if (reservation.status === 'cancelled') {
            return res.status(400).json({ error: 'Cette réservation est déjà annulée' });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        // Envoyer l'email d'annulation
        try {
            await sendCancellationEmail(reservation);
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // On continue même si l'envoi d'email échoue
        }

        res.json({ message: 'Réservation annulée avec succès', reservation });
    } catch (error) {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        res.status(500).json({ error: 'Erreur lors de l\'annulation de la réservation' });
    }
};

// Obtenir toutes les réservations (Admin)
const getAllReservations = async (req, res) => {
    try {
        const allReservations = await Reservation.find()
            .populate('parking')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Toutes les réservations récupérées avec succès',
            reservations: allReservations
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de toutes les réservations:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération de toutes les réservations',
            error: error.message
        });
    }
};

// Supprimer une réservation (Admin)
const deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }

        // Vérifier si la réservation est annulée
        if (reservation.status !== 'cancelled') {
            return res.status(400).json({ error: 'Seules les réservations annulées peuvent être supprimées' });
        }

        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Réservation supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la réservation:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la réservation' });
    }
};

module.exports = {
    createReservation,
    getUserReservations,
    getReservation,
    cancelReservation,
    getPendingReservations,
    confirmReservation,
    rejectReservation,
    getAllReservations,
    deleteReservation
}; 