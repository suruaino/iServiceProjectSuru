const express = require('express');
const authRoutes = require('./routes/authRoutes');
const cors= require('cors');
const PORT = 4000
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
