const express = require("express");
const {
  signup_controller,
  signin_controller,
  getProfile,
  confirmapi,
} = require("./user controller");
const authmiddleware = require("./authmiddleware");
const router = express.Router();

// Route to handle user signup
router.post("/signup", signup_controller);

// Route to handle user signin
router.post("/signin", signin_controller);

// Route to get user profile, protected by authentication middleware
router.get("/profile", authmiddleware, getProfile);

// Route to confirm user email
router.get("/confirm", confirmapi);

module.exports = router;
