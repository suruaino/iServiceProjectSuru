const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true
 },
  booking_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
},
  client_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
},
  amount: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
},
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 
    'unpaid' 
}, // unpaid, paid
});

module.exports = Payment;
