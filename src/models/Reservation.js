const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    vehiclePlate: {
        type: String,
        required: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    parking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parking',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Vérification que la date de fin est après la date de début
reservationSchema.pre('save', function(next) {
    if (this.startDate >= this.endDate) {
        next(new Error('La date de fin doit être après la date de début'));
    }
    next();
});

module.exports = mongoose.model('Reservation', reservationSchema); 