const {DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
},
  client_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
 },
  artisan_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
},
  date: { 
    type: DataTypes.DATE, 
    allowNull: false 
},
  time: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  status: { type: DataTypes.STRING, 
    defaultValue: "pending" 
}, // pending, confirmed, cancelled
});

module.exports = Booking;
