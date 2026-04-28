// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
    }
});

const sendCancellationEmail = async (reservation) => {
  const mailOptions = {
    from: '"Facilities Booking" <tbeopoulos@gmail.com>',
    to: process.env.ADMIN_EMAIL, // ή και πολλαπλοί admins
    subject: 'Νέα Ακύρωση Κράτησης',
    html: `
      <h3>Η παρακάτω κράτηση ακυρώθηκε:</h3>
      <ul>
        <li><strong>Όνομα χρήστη:</strong> ${reservation.user}</li>
        <li><strong>Εγκατάσταση:</strong> ${reservation.facility.name}</li>
        <li><strong>Ημερομηνία:</strong> ${new Date(reservation.date).toLocaleDateString()}</li>
        <li><strong>Ώρα:</strong> ${reservation.timeSlot}</li>
        <li><strong>Ημερομηνία Ακύρωσης:</strong> ${new Date(reservation.createdAt).toLocaleString()}</li>
      </ul>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email ακύρωσης στάλθηκε στον admin');
  } catch (err) {
    console.error('❌ Σφάλμα κατά την αποστολή email:', err);
  }
};

// ✅ Νέα συνάρτηση: Επιβεβαίωση κράτησης στον χρήστη
const sendUserConfirmation = async (reservation, userEmail) => {
  const mailOptions = {
    from: '"Facilities Booking" <tbeopoulos@gmail.com>',
    to: userEmail,
    subject: 'Επιβεβαίωση Κράτησης',
    html: `
      <h3>Επιβεβαίωση Κράτησης</h3>
      <p>Αγαπητέ χρήστη, η κράτησή σας καταχωρήθηκε επιτυχώς:</p>
      <ul>
        <li><strong>Εγκατάσταση:</strong> ${reservation.facility.name}</li>
        <li><strong>Ημερομηνία:</strong> ${new Date(reservation.date).toLocaleDateString()}</li>
        <li><strong>Ώρα:</strong> ${reservation.timeSlot}</li>
      </ul>
      <p>Σας ευχαριστούμε!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email επιβεβαίωσης στάλθηκε στον χρήστη');
  } catch (err) {
    console.error('❌ Σφάλμα αποστολής email επιβεβαίωσης:', err);
  }
};

// ✅ Νέα συνάρτηση: Ακύρωση κράτησης από admin προς χρήστη
const sendUserCancellation = async (reservation, userEmail) => {
  const mailOptions = {
    from: '"Facilities Booking" <tbeopoulos@gmail.com>',
    to: userEmail,
    subject: 'Ακύρωση Κράτησης από Διαχειριστή',
    html: `
      <h3>Η κράτησή σας ακυρώθηκε από τον διαχειριστή</h3>
      <ul>
        <li><strong>Εγκατάσταση:</strong> ${reservation.facility.name}</li>
        <li><strong>Ημερομηνία:</strong> ${new Date(reservation.date).toLocaleDateString()}</li>
        <li><strong>Ώρα:</strong> ${reservation.timeSlot}</li>
      </ul>
      <p>Εάν έχετε απορίες, παρακαλώ επικοινωνήστε με το διαχειριστή.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email ακύρωσης στάλθηκε στον χρήστη');
  } catch (err) {
    console.error('❌ Σφάλμα αποστολής email ακύρωσης:', err);
  }
};

module.exports = {
  sendCancellationEmail,
  sendUserConfirmation,
  sendUserCancellation
};
