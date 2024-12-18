const express = require('express');
const axios = require('axios');
const Payment = require('../models/payment');
const Booking = require('../models/booking');
require('dotenv').config();

const router = express.Router();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize payment
router.post('/payments/initiate', async (req, res) => {
  try {
    const { booking_id, client_id, amount, email } = req.body;

    // Save payment record with "unpaid" status
    const payment = await Payment.create({ booking_id, client_id, amount });

    // Initialize Paystack transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { email, amount: amount * 100 },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );

    res.status(200).json({ payment, authorization_url: response.data.data.authorization_url });
  } catch (error) {
    res.status(500).json({ error: 'Error initializing payment' });
  }
});

// Verify payment
router.get('/payments/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify payment using Paystack API
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    if (response.data.data.status === 'success') {
      const payment = await Payment.findOne({ where: { id: response.data.data.metadata.payment_id } });
      if (payment) {
        payment.status = 'paid';
        await payment.save();

        // Update booking status to confirmed
        const booking = await Booking.findOne({ where: { id: payment.booking_id } });
        if (booking) {
          booking.status = 'confirmed';
          await booking.save();
        }
      }
      return res.status(200).json({ message: 'Payment verified successfully' });
    }

    res.status(400).json({ error: 'Payment verification failed' });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying payment' });
  }
});

module.exports = router;
