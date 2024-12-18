const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { findByEmail, createUser } = require("../models/userModel");
const User = require("../models/userModel");
const userSchemas = require("../schemas/userSchemas");

require("dotenv").config();

// Utility function to generate tokens
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await findByEmail(email);

        // If user does not exist, create a new user
        if (!user) {
          user = await createUser(profile.displayName, email, null, null); // Password and phoneNumber are optional
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`;
        let user = await findByEmail(email);

        // If user does not exist, create a new user
        if (!user) {
          user = await createUser(profile.displayName, email, null, null);
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Handlers for traditional signup/login
const createUserHandler = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, work, rate } = await userSchemas.signup.validateAsync(req.body);

    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS) || 10);
    const user = await createUser(fullName, email, hashedPassword, phoneNumber);

    res.status(201).json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    res.status(400).json({ error: error.details ? error.details[0].message : error.message });
  }
};

const loginUserHandler = async (req, res) => {
  try {
    const { email, password } = await userSchemas.signin.validateAsync(req.body);

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(400).json({ error: error.details ? error.details[0].message : error.message });
  }
};

// Routes for Google OAuth
const googleAuthHandler = passport.authenticate("google", { scope: ["profile", "email"] });

const googleAuthCallbackHandler = (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = generateTokens(user);
  res.status(200).json({ message: "Google login successful", accessToken, refreshToken });
};

// Routes for Facebook OAuth
const facebookAuthHandler = passport.authenticate("facebook", { scope: ["email"] });

const facebookAuthCallbackHandler = (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = generateTokens(user);
  res.status(200).json({ message: "Facebook login successful", accessToken, refreshToken });
};

// Fetch all users
const getUsersHandler = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Fetch a single user by ID
const getUserHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Id must be a number" });
    }

    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// Update user handler
const updateUserHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { fullName, email } = await userSchemas.updateUser.validateAsync(req.body);

    // Check if the user exists
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    user.fullName = fullName;
    user.email = email;
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.details ? error.details[0].message : error.message });
  }
};

// Delete user handler
const deleteUserHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Id must be a number" });
    }

    // Find the user
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

module.exports = {
  createUserHandler,
  loginUserHandler,
  getUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  googleAuthCallbackHandler,
  facebookAuthCallbackHandler
};
