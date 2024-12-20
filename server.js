const express = require('express');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoute');
const paymentRoutes = require('./routes/paymentRoute');
const artisanRoute = require('./routes/artisanRoute')
const cors= require('cors');
const PORT = 4000
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('api',artisanRoute )
app.use('/api', bookingRoutes);
app.use('/api', paymentRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
