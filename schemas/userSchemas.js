const Joi = require("joi");

const createUserHandler = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().optional(),
  password: Joi.string().min(8).required(),
  work: Joi.string().required(),
  rate: Joi.string().required()
});

const loginUserHandler = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserHandler = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  work: Joi.string().optional(),
  rate: Joi.string().optional()
});

module.exports = {  createUserHandler, loginUserHandler, updateUserHandler };
