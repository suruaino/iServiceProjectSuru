const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { findByEmail, createUser } = require('../models/userModel');

require('dotenv').config();

const signup = async (req, res) => {
    try {
        const schema = Joi.object({
            fullName: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
        });

        const { fullName, email, password } = await schema.validateAsync(req.body);

        const existingUser = await findByEmail(email);
        if (existingUser) {
            return res.status(400).json(
                { message: 'Email already exists' }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(fullName, email, hashedPassword);

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const signin = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        const { email, password } = await schema.validateAsync(req.body);

        const user = await findByEmail(email);
        if (!user){
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        } 

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { signup, signin };
