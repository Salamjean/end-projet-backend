require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const parkingRoutes = require('./routes/parkingRoutes');

const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
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