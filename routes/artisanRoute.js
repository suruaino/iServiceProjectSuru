const express = require("express");
const {
  createUserHandler,
  getUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  loginUserHandler,
  googleAuthCallbackHandler,
  facebookAuthCallbackHandler
} = require("../controllers/artisanController");
const router = express.Router();
const {validateToken} = require('../middlewares/authMiddleware');


router.get("/", getUsersHandler);
router.get("/:id", getUserHandler);
router.post("/", createUserHandler);
router.put("/:id", validateToken, updateUserHandler);
router.delete("/:id", deleteUserHandler);
router.post("/login", loginUserHandler);
router.post("/google", googleAuthCallbackHandler)
router.post("/facebook", facebookAuthCallbackHandler)
module.exports = router;
