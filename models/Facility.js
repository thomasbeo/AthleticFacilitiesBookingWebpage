const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String, 
    photoUrl: String,
    available: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.model('Facility', facilitySchema);