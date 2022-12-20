// Require user controller
const express1 = require("express");
const illness_router = express1.Router();
const illness_controller = require("../controllers/illnessesController");

illness_router.get("/illnesses", illness_controller.index);
illness_router.post("/illnesses", illness_controller.create);
illness_router.put("/illnesses/:id", illness_controller.update);
illness_router.delete("/illnesses/:id", illness_controller.delete);

module.exports = illness_router;
