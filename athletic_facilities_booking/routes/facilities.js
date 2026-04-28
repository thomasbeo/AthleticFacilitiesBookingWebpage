// routes/facilities.js
const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');

// GET /api/facilities - επιστρέφει όλα τα facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
    const { name, description, photoUrl } = req.body;
  
    try {
      const facility = new Facility({
        name,
        description,
        photoUrl
      });
  
      await facility.save();
      res.status(201).json(facility);
    } catch (error) {
      console.error('Error creating facility:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
