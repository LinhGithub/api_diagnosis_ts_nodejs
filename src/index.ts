import { AppDataSource } from "./data-source";
const cors = require("cors");
const createError = require("http-errors");
require("express-async-errors");
const morgan = require("morgan");
const dotenv = require("dotenv");

const home_router = require("../src/routes/homeRouter");
const illnesses_router = require("../src/routes/illnessesRouter");
const diagnosis_router = require("../src/routes/diagnosisRouter");
const rules_router = require("../src/routes/rulesRouter");
const auth_router = require("../src/routes/authRouter");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
dotenv.config();

app.use("/", home_router);
app.use("/", diagnosis_router);
app.use("/", illnesses_router);
app.use("/", rules_router);
app.use("/", auth_router);

app.use((req, res, next) => {
  next(createError(404));
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

app.listen("8000", function () {
  console.log(`server: http://localhost:${"8000"}`);
});
