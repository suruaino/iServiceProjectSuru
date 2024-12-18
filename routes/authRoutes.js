const express = require("express");
const {
  createUserHandler,
  getUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  loginUserHandler,
} = require("../controllers/authController");
const router = express.Router();
const {validateToken} = require('../middlewares/authMiddleware');


router.get("/", getUsersHandler);
router.get("/:id", getUserHandler);
router.post("/", createUserHandler);
router.put("/:id", validateToken, updateUserHandler);
router.delete("/:id", deleteUserHandler);
router.post("/login", loginUserHandler);

module.exports = router;
