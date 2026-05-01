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
    const captchaRes = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );

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
      console.error("🔥 REGISTER ERROR:", err);
      console.error(err.stack);
      return res.status(500).json({
        message: 'Σφάλμα εγγραφής.',
        error: err.message
    });
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
      console.error("🔥 LOGIN ERROR:", err);
      console.error(err.stack);
      return res.status(500).json({
        message: 'Σφάλμα κατά τη σύνδεση.',
        error: err.message
    });
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
    console.log("📩 Forgot password request for:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: 'Δεν βρέθηκε χρήστης με αυτό το email.' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `https://athleticfacilitiesbookingwebpage.onrender.com/reset-password.html?token=${token}`;

    console.log("🔗 Reset URL:", resetURL);

    await sendEmail({
      to: user.email,
      subject: "Επαναφορά Συνθηματικού",
      text: `Reset link: ${resetURL}`,
      html: `<a href="${resetURL}">${resetURL}</a>`
    });

    res.json({ message: '📧 Στάλθηκε email επαναφοράς συνθηματικού.' });

  } catch (err) {
    console.error("🔥 FORGOT PASSWORD ERROR:", err);
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
