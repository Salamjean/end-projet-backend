const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes protégées par l'authentification
router.use(authMiddleware);

// Créer un nouveau client
router.post('/', clientController.createClient);

// Obtenir tous les clients
router.get('/', clientController.getAllClients);

// Obtenir un client spécifique
router.get('/:id', clientController.getClient);

// Mettre à jour un client
router.put('/:id', clientController.updateClient);

// Supprimer un client
router.delete('/:id', clientController.deleteClient);

module.exports = router; 