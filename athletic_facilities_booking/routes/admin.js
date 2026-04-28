const express = require('express');
const Facility = require('../models/Facility');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const router = express.Router();
const upload = require('../middlewares/upload');

// Middleware: Να επιτρέπεται πρόσβαση μόνο σε admins
function isAdmin(req, res, next) {
    if (req.session.userRole === 'admin') {
        return next();
    }
    res.status(403).send('Access Denied');
}

// Admin Dashboard
router.get('/admin', isAdmin, async (req, res) => {
    const facilities = await Facility.find();
    const reservations = await Reservation.find().populate('user facility');
    const users = await User.find();
    res.render('admin/dashboard', { facilities, reservations, users });
});

// Δημιουργία νέας εγκατάστασης
router.post('/admin/facilities', isAdmin, upload.single('photo'), async (req, res) => {
    const { name, description } = req.body;
    const photoUrl = req.file ? '/uploads/' + req.file.filename : null;

    await Facility.create({ name, description, photoUrl });
    res.redirect('/admin');
});

// Διαγραφή εγκατάστασης
router.post('/admin/facilities/delete/:id', isAdmin, async (req, res) => {
    await Facility.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
});

// Διαγραφή κράτησης
router.post('/admin/reservations/delete/:id', isAdmin, async (req, res) => {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
});

// Διαγραφή χρήστη
router.post('/admin/users/delete/:id', isAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
});

module.exports = router;
