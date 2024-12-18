const Joi = require("joi");

const signup = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().optional(),
  password: Joi.string().min(8).required(),
});

const signin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUser = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
});

module.exports = { signup, signin, updateUser };
