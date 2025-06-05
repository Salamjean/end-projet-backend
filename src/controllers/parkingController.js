const Parking = require('../models/Parking');

// Créer un nouveau parking
const createParking = async (req, res) => {
  try {
    console.log('Données reçues:', req.body);

    // Vérifier si tous les champs requis sont présents
    const requiredFields = ['name', 'address', 'totalSpots', 'pricePerHour'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Champs manquants:', missingFields);
      return res.status(400).json({ 
        error: `Champs manquants : ${missingFields.join(', ')}` 
      });
    }

    // Créer un nouvel objet parking avec les données validées
    const parkingData = {
      name: req.body.name,
      address: req.body.address,
      totalSpots: parseInt(req.body.totalSpots),
      availableSpots: parseInt(req.body.totalSpots), // Initialement égal au total
      pricePerHour: parseFloat(req.body.pricePerHour),
      description: req.body.description || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      openingHours: req.body.openingHours || '24h/24, 7j/7'
    };

    // Gérer les services si présents
    if (req.body.services && Array.isArray(req.body.services)) {
      parkingData.services = req.body.services.filter(service => service.trim() !== '');
    }

    // Gérer l'image si présente
    if (req.file) {
      parkingData.image = req.file.filename;
    }

    console.log('Données du parking à créer:', parkingData);

    const parking = new Parking(parkingData);
    
    // Valider le modèle avant de sauvegarder
    const validationError = parking.validateSync();
    if (validationError) {
      console.error('Erreur de validation:', validationError);
      return res.status(400).json({
        error: 'Erreur de validation des données',
        details: validationError.message
      });
    }

    const savedParking = await parking.save();
    console.log('Parking créé avec succès:', savedParking);

    res.status(201).json({
      message: 'Parking créé avec succès',
      parking: savedParking
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la création du parking:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Erreur de validation des données',
        details: error.message
      });
    }

    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        error: 'Erreur de base de données',
        details: error.message
      });
    }

    res.status(500).json({ 
      error: 'Erreur lors de la création du parking',
      details: error.message 
    });
  }
};

// Obtenir tous les parkings
const getAllParkings = async (req, res) => {
  try {
    console.log('Tentative de récupération de tous les parkings...');
    const parkings = await Parking.find({});
    console.log('Parkings trouvés:', parkings);
    res.json(parkings);
  } catch (error) {
    console.error('Erreur lors de la récupération des parkings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir un parking par son ID
const getParkingById = async (req, res) => {
  try {
    console.log('Tentative de récupération du parking avec l\'ID:', req.params.id);
    const parking = await Parking.findById(req.params.id);
    console.log('Parking trouvé:', parking);
    
    if (!parking) {
      console.log('Parking non trouvé');
      return res.status(404).json({ error: 'Parking non trouvé' });
    }
    
    res.json(parking);
  } catch (error) {
    console.error('Erreur lors de la récupération du parking:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un parking
const updateParking = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'address', 'totalSpots', 'pricePerHour', 'image', 'isActive', 'description', 'services', 'openingHours'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Mise à jour invalide' });
  }

  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking non trouvé' });
    }

    // Si le nombre total de places est modifié, ajuster les places disponibles
    if (updates.includes('totalSpots')) {
      const difference = parseInt(req.body.totalSpots) - parking.totalSpots;
      req.body.availableSpots = parking.availableSpots + difference;
    }

    // Convertir les valeurs numériques
    if (updates.includes('totalSpots')) {
      req.body.totalSpots = parseInt(req.body.totalSpots);
    }
    if (updates.includes('pricePerHour')) {
      req.body.pricePerHour = parseFloat(req.body.pricePerHour);
    }

    // Mettre à jour les champs
    updates.forEach(update => {
      parking[update] = req.body[update];
    });

    await parking.save();
    res.json({
      message: 'Parking mis à jour avec succès',
      parking
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du parking:', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un parking
const deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findByIdAndDelete(req.params.id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking non trouvé' });
    }
    res.json({ message: 'Parking supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du parking:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createParking,
  getAllParkings,
  getParkingById,
  updateParking,
  deleteParking
}; 