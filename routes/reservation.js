// routes/reservation.js

const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { sendUserCancellation, sendUserConfirmation, sendCancellationEmail } = require('../utils/emailService');

function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// ------------------------- Εγκαταστάσεις ------------------------- //
router.get('/facilities', isAuthenticated, async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.render('facilities', { facilities });
  } catch (err) {
    console.error(err);
    res.send('Error loading facilities');
  }
});

// ------------------------- Εμφάνιση εγκατάστασης για κράτηση ------------------------- //
router.get('/reserve/:id', isAuthenticated, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    res.render('reserve', { facility });
  } catch (err) {
    console.error(err);
    res.send('Error loading reservation page');
  }
});

router.get('/api/cancelled-reservations', isAdmin, async (req, res) => {
  try {
    const cancelled = await Reservation.find({ isCanceled: true }).populate('facility');
    const filtered = cancelled.filter(r => r.facility); // <== ✅ μόνο όσες έχουν facility
    res.json(filtered);
  } catch (err) {
    console.error('Error loading cancelled reservations:', err);
    res.status(500).json({ message: 'Σφάλμα κατά τη φόρτωση ακυρωμένων.' });
  }
});

function isAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Δεν είστε συνδεδεμένος.' });
  }

  User.findById(req.session.userId).then(user => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Απαγορεύεται η πρόσβαση.' });
    }
    next();
  }).catch(err => {
    console.error('Admin check error:', err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή.' });
  });
}

// ------------------------- Δημιουργία κράτησης μέσω σελίδας ------------------------- //
router.post('/reserve/:id', isAuthenticated, async (req, res) => {
  const { date, timeSlot } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    const facility = await Facility.findById(req.params.id);

    await Reservation.create({
      user: user.username,
      facility: req.params.id,
      date,
      timeSlot
    });

    await sendEmail(
      user.email,
      'Reservation Confirmed',
      `<h1>Reservation Successful!</h1><p>You reserved: ${facility.name}</p><p>Date: ${date}</p><p>Time Slot: ${timeSlot}</p>`
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Error making reservation');
  }
});

// ------------------------- Ενημέρωση κράτησης ------------------------- //
router.put('/api/reservations/:id', async (req, res) => {
  const { date, timeSlot } = req.body;

  if (!date || !timeSlot) return res.status(400).json({ message: 'Ημερομηνία και ώρα απαιτούνται.' });

  try {
    const existing = await Reservation.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Η κράτηση δεν βρέθηκε.' });

    const conflict = await Reservation.findOne({
      _id: { $ne: req.params.id },
      facility: existing.facility,
      date,
      timeSlot
    });

    if (conflict) {
      return res.status(400).json({ message: 'Υπάρχει ήδη κράτηση για την ίδια ώρα σε αυτή την εγκατάσταση.' });
    }

    existing.date = date;
    existing.timeSlot = timeSlot;
    await existing.save();

    res.status(200).json({ message: 'Η κράτηση ενημερώθηκε.' });
  } catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την ενημέρωση.' });
  }
});

// ------------------------- Κρατήσεις χρήστη (Dashboard) ------------------------- //
router.get('/api/my-reservations', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Δεν είστε συνδεδεμένος.' });

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'Χρήστης δεν βρέθηκε.' });

    const username = user.username.trim().replace(/\s+/g, ' '); // normalize πολλά κενά

    const regex = new RegExp(`^\\s*${username}\\s*$`, 'i'); // επιτρέπουμε κενά αριστερά/δεξιά

    const reservations = await Reservation.find({ user: { $regex: regex }, isCanceled: { $ne: true } }).populate('facility');

    res.json(reservations);
  } catch (err) {
      console.error('Error loading user reservations:', err);
      res.status(500).json({ message: 'Σφάλμα κατά τη φόρτωση.' });
  }
});

// ------------------------- Δημιουργία κράτησης από index.html ------------------------- //
router.post('/api/reservations', async (req, res) => {
  const { facility, userName, date, timeSlot } = req.body;

  if (!facility || !userName || !date || !timeSlot) {
    return res.status(400).json({ message: 'Όλα τα πεδία είναι υποχρεωτικά.' });
  }

  try {
    const conflict = await Reservation.findOne({ facility, date, timeSlot });
    if (conflict) return res.status(400).json({ message: 'Υπάρχει ήδη κράτηση για την συγκεκριμένη ώρα!' });

    const newReservation = new Reservation({
      facility,
      user: userName.trim(),
      date,
      timeSlot
    });

    await newReservation.save();

    // ✅ Βρες email χρήστη και στείλε επιβεβαίωση
    const user = await User.findOne({ username: userName.trim() });
    if (user?.email) {
      const populatedReservation = await Reservation.findById(newReservation._id).populate('facility');
      await sendUserConfirmation(populatedReservation, user.email);
    }

    res.status(201).json({ message: 'Η κράτηση αποθηκεύτηκε με επιτυχία!' });
  } catch (err) {
    console.error('Error saving reservation:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την αποθήκευση κράτησης.' });
  }
});


// ------------------------- Έλεγχος διαθεσιμότητας ------------------------- //
router.post('/api/reservations/availability', async (req, res) => {
  const { facilityId, date } = req.body;

  if (!facilityId || !date) return res.status(400).json({ message: 'Facility και ημερομηνία απαιτούνται.' });

  try {
    const selectedDate = new Date(date);
    const reservations = await Reservation.find({ facility: facilityId, date: selectedDate });
    const takenSlots = reservations.map(r => r.timeSlot);
    res.json({ takenSlots });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ message: 'Σφάλμα κατά τον έλεγχο διαθεσιμότητας.' });
  }
});

// ------------------------- Όλες οι κρατήσεις (για admin ή προβολή) ------------------------- //
router.get('/api/reservations', async (req, res) => {
  // try {
  //   const reservations = await Reservation.find({ isCanceled: { $ne: true } }).populate('facility');
  //   res.json(reservations);
  // } catch (err) {
  //   console.error('Error fetching reservations:', err);
  //   res.status(500).json({ message: 'Σφάλμα ανάκτησης κρατήσεων' });
  // }
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await User.findById(req.session.userId);

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const reservations = await Reservation.find().populate('facility');
  res.json(reservations);
});

// Ακύρωση κράτησης (soft delete)
router.put('/api/reservations/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('facility');
    if (!reservation) return res.status(404).json({ message: 'Κράτηση δεν βρέθηκε.' });

    reservation.isCanceled = true;
    await reservation.save();

    await sendCancellationEmail(reservation);

    // Βρες το email του χρήστη
    const user = await User.findOne({ username: reservation.user });
    if (user?.email) {
      await sendUserCancellation(reservation, user.email);
    }

    res.status(200).json({ message: 'Η κράτηση ακυρώθηκε και εστάλη email.' });
  } catch (err) {
    console.error('Error canceling reservation:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την ακύρωση κράτησης.' });
  }
});

// Επαναφορά κράτησης
router.put('/api/reservations/:id/restore', async (req, res) => {
  try {
    await Reservation.findByIdAndUpdate(req.params.id, { isCanceled: false });
    res.status(200).json({ message: 'Η κράτηση επανήλθε.' });
  } catch (err) {
    console.error('Error restoring reservation:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την επαναφορά.' });
  }
});

module.exports = router;
