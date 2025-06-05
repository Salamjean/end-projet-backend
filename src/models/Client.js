const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    vehiclePlate: {
        type: String,
        trim: true
    },
    vehicleModel: {
        type: String,
        trim: true
    },
    parking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parking'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    duration: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Mettre à jour updatedAt avant chaque sauvegarde
clientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Client', clientSchema); 