const express = require("express");
const router = express.Router();

const authMiddleware = require("./middleware/AuthMiddleware");
const authController = require("./controllers/AuthController");
const homeController = require("./controllers/HomeController");

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/validate", authController.validate_token);

router.get("/", authMiddleware.validate, homeController.home);

module.exports = router;
