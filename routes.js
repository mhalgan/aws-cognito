const express = require("express");
const router = express.Router();

const authController = require("./controllers/AuthController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/validate", authController.validate_token);

module.exports = router;
