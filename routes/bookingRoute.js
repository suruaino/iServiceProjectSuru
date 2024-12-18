const express = require('express');
const Booking = require('../models/bookingModel');
const router = express.Router();

// Create a booking
router.post('/bookings', async (req, res) => {
  try {
    const { client_id, artisan_id, date, time } = req.body;

    const existingBooking = await Booking.findOne({
      where: { artisan_id, date, time }
    });
    if (existingBooking) {
      return res.status(400).json({ error: 'Artisan not available at this time' });
    }

    const newBooking = await Booking.create({ client_id, artisan_id, date, time });
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Get all bookings for a client
router.get('/bookings/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;
    const bookings = await Booking.findAll({ where: { client_id } });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

module.exports = router;
