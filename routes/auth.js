const axios = require('axios');
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

// Εγγραφή
router.post('/api/register', async (req, res) => {
  const { fullName, email, password, token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Αποτυχία επαλήθευσης captcha.' });
  }

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Όλα τα πεδία είναι υποχρεωτικά.' });
  }

  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=6LdVvlgrAAAAADqmisVYw5V09HWvnXfHnfrKCA_N&response=${token}`;
    const captchaRes = await axios.post(verifyUrl);

    if (!captchaRes.data.success) {
      return res.status(400).json({ message: 'Αποτυχία captcha επαλήθευσης.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Ο χρήστης υπάρχει ήδη.' });

    const newUser = new User({ username: fullName, email, password });
    await newUser.save();

    req.session.userId = newUser._id;
    res.status(201).json({ message: 'Εγγραφή επιτυχής' });
  } catch (err) {
    console.error(err);
    console.error('Captcha error:', err);
    res.status(500).json({ message: 'Σφάλμα εγγραφής.' });
    return res.status(500).json({ message: 'Σφάλμα κατά την επαλήθευση captcha.' });
  }
});

// Login
router.post('/api/login', async (req, res) => {
  const { email, password, token } = req.body;

  if (!token) return res.status(400).json({ message: 'Λείπει το reCAPTCHA.' });

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: secretKey,
        response: token
      }
    });

    if (!response.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA αποτυχία επαλήθευσης.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Λάθος email ή κωδικός.' });
    }

    req.session.userId = user._id;
    res.json({ message: 'Επιτυχής σύνδεση', user: { id: user._id, name: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Σφάλμα κατά τη σύνδεση.' });
  }
});

// Logout
router.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Αποσυνδεθήκατε.' });
  });
});

router.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Δεν βρέθηκε χρήστης με αυτό το email.' });
    }

    // Δημιουργία token
    const token = crypto.randomBytes(20).toString('hex');

    // Αποθήκευση token και λήξης
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 ώρα
    await user.save();

    const sendEmail = require("../sendEmail");

    // ...
    const resetURL = `http://localhost:3000/reset-password.html?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Επαναφορά Συνθηματικού",
      text: `Πατήστε τον παρακάτω σύνδεσμο για επαναφορά συνθηματικού: ${resetURL}`,
      html: `<p>Πατήστε τον παρακάτω σύνδεσμο για να επαναφέρετε το συνθηματικό σας:</p>
            <a href="${resetURL}">${resetURL}</a>`
    });

    // Email προς τον χρήστη
    await sendEmail({
      to: user.email,
      subject: 'Επαναφορά Συνθηματικού',
      text: `Πατήστε τον παρακάτω σύνδεσμο για επαναφορά συνθηματικού: ${resetURL}`,
      html: `<p>Πατήστε τον παρακάτω σύνδεσμο για να επαναφέρετε το συνθηματικό σας:</p>
            <a href="${resetURL}">${resetURL}</a>`
    });

    res.json({ message: '📧 Στάλθηκε email επαναφοράς συνθηματικού.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή.' });
  }
});

// POST /api/reset-password/:token
router.post('/api/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Μη έγκυρος ή ληγμένος σύνδεσμος.' });
    }

    user.password = req.body.password; // 🚀 Δεν κάνουμε hash εδώ
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save(); // εδώ το pre('save') θα κάνει hash

    res.json({ message: '✅ Το συνθηματικό άλλαξε με επιτυχία.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή.' });
  }
});

// Επιστροφή τρέχοντος χρήστη από το session
router.get('/api/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Δεν είστε συνδεδεμένος.' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'Χρήστης δεν βρέθηκε.' });

    res.json({ id: user._id, name: user.username, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Σφάλμα εύρεσης χρήστη.' });
  }
});

module.exports = router;
