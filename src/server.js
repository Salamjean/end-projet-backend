const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/authRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const clientRoutes = require('./routes/clientRoutes');
const healthRoutes = require('./routes/health');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Création de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.resolve(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(uploadsDir));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connecté à MongoDB');
        console.log('URI de connexion:', process.env.MONGODB_URI);
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de gestion de parking' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue!' });
});

// Port du serveur
const PORT = process.env.PORT || 5000;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 