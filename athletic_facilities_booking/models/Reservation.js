const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
      type: String,
      required: true,
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isCanceled: {
      type: Boolean,
      default: false,
    }
  });
  
  module.exports = mongoose.model('Reservation', reservationSchema);