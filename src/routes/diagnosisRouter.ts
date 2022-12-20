const express2 = require("express");
const diagnosis_router = express2.Router();

// Require user controller
const diagnosis_controller = require("../controllers/diagnosisController");

diagnosis_router.post("/diagnosis", diagnosis_controller.index);

module.exports = diagnosis_router;
