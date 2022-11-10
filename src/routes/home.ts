const express = require("express");
const router = express.Router();

// Require user controller
const controller = require("../controllers/home");

router.get("/", controller.index);

module.exports = router;
