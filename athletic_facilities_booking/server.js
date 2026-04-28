const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
dotenv.config();
const hbs = require('hbs');
const facilityRoutes = require('./routes/facilities');
const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservation');
const adminRoutes = require('./routes/admin');
const exphbs = require('express-handlebars');
const app = express();

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ⚡ Serve the frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve images correctly
app.use('/images', express.static(path.join(__dirname, 'frontend', 'images')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false } // false για localhost
}));

// 1. Set Handlebars as view engine
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'admin', 'layouts'), // ✅ εδώ το main.hbs
  partialsDir: path.join(__dirname, 'views', 'partials') // optional: για μικρά components
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')); // views = root του views folder

// 2. Ορίζεις τον φάκελο views
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.use('/api/facilities', facilityRoutes); 
app.use('/', authRoutes); 
app.use('/', reservationRoutes);
app.use('/', adminRoutes);

const Reservation = require('./models/Reservation');
const Facility = require('./models/Facility');
const User = require('./models/User');

app.get('/dashboard-hbs', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login.html');

  const user = await User.findById(req.session.userId);
  const reservations = await Reservation.find({ user: user.username }).populate('facility');

  res.render('dashboard', {
    username: user.username,
    reservations
  });
});

app.get('/admin/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.redirect('/');
    }

    const facilities = await Facility.find();
    const reservations = await Reservation.find().populate('facility');
    const users = await User.find();

    res.render('admin/dashboard', {
        layout: 'main',
        facilities,
        reservations,
        users
    });
} catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).send('Σφάλμα στον πίνακα διαχείρισης.');}
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
