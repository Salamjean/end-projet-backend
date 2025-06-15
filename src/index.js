require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const parkingRoutes = require('./routes/parkingRoutes');

const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du dossier uploads
const uploadsPath = path.join(__dirname, '..', 'public', 'uploads');
console.log('Chemin des uploads:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.url.startsWith('/uploads/')) {
    console.log('Tentative d\'accès à une image:', req.url);
  }
  next();
});

// Routes
app.use('/api/parkings', parkingRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur globale:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  res.status(500).json({
    error: 'Erreur serveur',
    details: err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? 'Configuré' : 'Non configuré'
  });
}); 