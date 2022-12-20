const express3 = require("express");
const rules_router = express3.Router();

// Require user controller
const rules_controller = require("../controllers/rulesController");

rules_router.get("/rules", rules_controller.index);
rules_router.post("/rules", rules_controller.create);
rules_router.put("/rules/:id", rules_controller.update);
rules_router.delete("/rules/:id", rules_controller.delete);

module.exports = rules_router;
