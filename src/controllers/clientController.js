const Client = require('../models/Client');
const Reservation = require('../models/Reservation');

// Créer un nouveau client
const createClient = async (req, res) => {
    try {
        console.log('Données reçues:', req.body); // Log pour déboguer

        const { 
            name, 
            email, 
            phone, 
            vehiclePlate, 
            vehicleModel, 
            parkingId,
            startDate,
            endDate,
            duration,
            totalPrice
        } = req.body;

        // Vérifier si le client existe déjà
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ 
                message: 'Un client avec cet email existe déjà' 
            });
        }

        // Créer le nouveau client avec tous les champs
        const client = new Client({
            name,
            email,
            phone,
            vehiclePlate,
            vehicleModel,
            parking: parkingId,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            duration: duration || 0,
            totalPrice: totalPrice || 0
        });

        console.log('Client à sauvegarder:', client); // Log pour déboguer

        const savedClient = await client.save();
        
        console.log('Client sauvegardé:', savedClient); // Log pour déboguer

        res.status(201).json({
            message: 'Client créé avec succès',
            client: savedClient
        });
    } catch (error) {
        console.error('Erreur détaillée lors de la création du client:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la création du client',
            error: error.message 
        });
    }
};

// Obtenir tous les clients
const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find()
            .populate('parking')
            .populate('reservations')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Clients récupérés avec succès',
            clients
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des clients',
            error: error.message 
        });
    }
};

// Obtenir un client spécifique
const getClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id)
            .populate('parking')
            .populate('reservations');

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        res.json({
            message: 'Client récupéré avec succès',
            client
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du client:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération du client',
            error: error.message 
        });
    }
};

// Mettre à jour un client
const updateClient = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            phone, 
            vehiclePlate, 
            vehicleModel, 
            parkingId,
            startDate,
            endDate,
            duration,
            totalPrice
        } = req.body;
        
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        // Vérifier si l'email est déjà utilisé par un autre client
        if (email !== client.email) {
            const existingClient = await Client.findOne({ email });
            if (existingClient) {
                return res.status(400).json({ 
                    message: 'Cet email est déjà utilisé par un autre client' 
                });
            }
        }

        // Mettre à jour tous les champs
        client.name = name || client.name;
        client.email = email || client.email;
        client.phone = phone || client.phone;
        client.vehiclePlate = vehiclePlate || client.vehiclePlate;
        client.vehicleModel = vehicleModel || client.vehicleModel;
        client.parking = parkingId || client.parking;
        client.startDate = startDate ? new Date(startDate) : client.startDate;
        client.endDate = endDate ? new Date(endDate) : client.endDate;
        client.duration = duration || client.duration;
        client.totalPrice = totalPrice || client.totalPrice;

        const updatedClient = await client.save();

        res.json({
            message: 'Client mis à jour avec succès',
            client: updatedClient
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du client:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la mise à jour du client',
            error: error.message 
        });
    }
};

// Supprimer un client
const deleteClient = async (req, res) => {
    try {
        console.log(`Tentative de suppression du client ID: ${req.params.id}`);
        
        const client = await Client.findById(req.params.id);
        
        if (!client) {
            console.log('Client non trouvé');
            return res.status(404).json({ 
                success: false,
                message: 'Client non trouvé' 
            });
        }

        // Suppression des réservations associées (si elles existent)
        if (client.reservations && client.reservations.length > 0) {
            console.log(`Suppression des ${client.reservations.length} réservations associées`);
            await Reservation.deleteMany({ _id: { $in: client.reservations } });
        }

        // Suppression du client
        console.log('Suppression du client');
        await Client.deleteOne({ _id: req.params.id });

        console.log('Suppression réussie');
        res.json({ 
            success: true,
            message: 'Client et ses réservations supprimés avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur lors de la suppression',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    createClient,
    getAllClients,
    getClient,
    updateClient,
    deleteClient
}; 