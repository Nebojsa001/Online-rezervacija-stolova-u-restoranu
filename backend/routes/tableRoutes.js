const express = require("express");
const tableController = require("../controllers/tableController");
const router = express.Router();

router
  .route("/")
  .post(tableController.createTable)
  .get(tableController.getAllTables);

module.exports = router;
