const express = require("express");
const home_router = express.Router();

// Require user controller
const home_controller = require("../controllers/homeController");

home_router.get("/", home_controller.index);

module.exports = home_router;
