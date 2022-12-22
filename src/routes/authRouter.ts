const auth_express = require("express");
const auth_router = auth_express.Router();

const authController = require("../controllers/auth/authorController");

auth_router.post("/login", authController.login);
auth_router.post("/refresh_token", authController.refreshToken);

module.exports = auth_router;
