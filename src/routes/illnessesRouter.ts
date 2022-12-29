// Require user controller
const express1 = require("express");
const illness_router = express1.Router();
const illness_controller = require("../controllers/illnessesController");
const authMiddleware = require("../controllers/auth/authMiddlewares");
const isAuth = authMiddleware.isAuth;

illness_router.get("/illnesses", illness_controller.index);
illness_router.post("/illnesses/ids", illness_controller.get_by_ids);
illness_router.post("/illnesses", isAuth, illness_controller.create);
illness_router.put("/illnesses/:id", isAuth, illness_controller.update);
illness_router.delete("/illnesses/:id", isAuth, illness_controller.delete);

module.exports = illness_router;
