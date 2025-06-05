const nodemailer = require('nodemailer');

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Fonction pour envoyer un email de confirmation de réservation
const sendConfirmationEmail = async (reservation) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: reservation.email,
    subject: 'Confirmation de votre réservation de parking',
    html: `
      <h1>Confirmation de réservation</h1>
      <p>Bonjour ${reservation.name},</p>
      <p>Votre réservation de parking a été confirmée.</p>
      <h2>Détails de la réservation :</h2>
      <ul>
        <li>Parking : ${reservation.parking.name}</li>
        <li>Adresse : ${reservation.parking.address}</li>
        <li>Véhicule : ${reservation.vehicleModel} (${reservation.vehiclePlate})</li>
        <li>Date de début : ${new Date(reservation.startDate).toLocaleString('fr-FR')}</li>
        <li>Date de fin : ${new Date(reservation.endDate).toLocaleString('fr-FR')}</li>
        <li>Durée : ${reservation.duration} heures</li>
        <li>Montant total : ${reservation.totalPrice} FCFA</li>
      </ul>
      <p>Merci de votre confiance !</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de confirmation envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    throw error;
  }
};

// Fonction pour envoyer un email d'annulation de réservation
const sendCancellationEmail = async (reservation) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: reservation.email,
    subject: 'Annulation de votre réservation de parking',
    html: `
      <h1>Annulation de réservation</h1>
      <p>Bonjour ${reservation.name},</p>
      <p>Votre réservation de parking a été annulée.</p>
      <h2>Détails de la réservation annulée :</h2>
      <ul>
        <li>Parking : ${reservation.parking.name}</li>
        <li>Adresse : ${reservation.parking.address}</li>
        <li>Véhicule : ${reservation.vehicleModel} (${reservation.vehiclePlate})</li>
        <li>Date de début : ${new Date(reservation.startDate).toLocaleString('fr-FR')}</li>
        <li>Date de fin : ${new Date(reservation.endDate).toLocaleString('fr-FR')}</li>
        <li>Durée : ${reservation.duration} heures</li>
        <li>Montant total : ${reservation.totalPrice} FCFA</li>
      </ul>
      <p>Pour toute question, n'hésitez pas à nous contacter.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email d\'annulation envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email d\'annulation:', error);
    throw error;
  }
};

module.exports = {
  sendConfirmationEmail,
  sendCancellationEmail
}; 