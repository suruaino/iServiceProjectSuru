const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { findByEmail, createUser } = require("../models/userModel");
const User = require("../models/userModel");
const userSchemas = require("../schemas/userSchemas"); // Joi validation schemas

require("dotenv").config();

// Utility function to generate tokens
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Signup handler
const createUserHandler = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = await userSchemas.signup.validateAsync(req.body);

    const existingUser = await findByEmail(email);
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS) || 10);
    const user = await createUser(fullName, email, hashedPassword, phoneNumber);

    res.status(201).json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    res.status(400).json({ error: error.details ? error.details[0].message : error.message });
  }
};

// Signin handler
const loginUserHandler = async (req, res) => {
  try {
    const { email, password } = await userSchemas.signin.validateAsync(req.body);

    const user = await findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res.status(200).json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(400).json({ error: error.details ? error.details[0].message : error.message });
  }
};

// Fetch all users
const getUsersHandler = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch single user by ID
const getUserHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Id must be a number" });

    const user = await User.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user handler
const updateUserHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { fullName, email } = await userSchemas.updateUser.validateAsync(req.body);

    const user = await User.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName;
    user.email = email;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.details ? error.details[0].message : error.message });
  }
};

// Delete user handler
const deleteUserHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Id must be a number" });

    const user = await User.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUserHandler,
  loginUserHandler,
  getUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
};
