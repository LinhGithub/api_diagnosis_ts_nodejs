const express3 = require("express");
const rules_router = express3.Router();

// Require user controller
const rules_controller = require("../controllers/rulesController");
const authMiddleware1 = require("../controllers/auth/authMiddlewares");
const isAuth1 = authMiddleware1.isAuth;

rules_router.get("/rules", rules_controller.index);
rules_router.post("/rules", isAuth1, rules_controller.create);
rules_router.put("/rules/:id", isAuth1, rules_controller.update);
rules_router.delete("/rules/:id", isAuth1, rules_controller.delete);

module.exports = rules_router;
