const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du parking est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  address: {
    type: String,
    required: [true, "L'adresse est requise"],
    trim: true
  },
  totalSpots: {
    type: Number,
    required: [true, 'Le nombre total de places est requis'],
    min: [1, 'Le nombre de places doit être supérieur à 0']
  },
  availableSpots: {
    type: Number,
    required: [true, 'Le nombre de places disponibles est requis'],
    min: [0, 'Le nombre de places disponibles ne peut pas être négatif']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Le prix par heure est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  image: {
    type: String,
    default: 'default-parking.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  services: [{
    type: String,
    trim: true
  }],
  openingHours: {
    type: String,
    default: '24h/24, 7j/7'
  }
}, {
  timestamps: true
});

// Méthode pour vérifier si le parking est disponible
parkingSchema.methods.isAvailable = function() {
  return this.availableSpots > 0 && this.isActive;
};

// Middleware pre-save pour s'assurer que availableSpots ne dépasse pas totalSpots
parkingSchema.pre('save', function(next) {
  if (this.availableSpots > this.totalSpots) {
    this.availableSpots = this.totalSpots;
  }
  next();
});

const Parking = mongoose.model('Parking', parkingSchema);

module.exports = Parking; 