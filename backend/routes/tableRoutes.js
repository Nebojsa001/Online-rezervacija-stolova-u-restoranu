const express = require("express");
const tableController = require("../controllers/tableController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin,waiter"),
    tableController.createTable
  )
  .get(tableController.getAllTables);

router.delete(
  "/:id",
  authController.protect,
  authController.restrictTo("admin,waiter"),
  tableController.deleteTable
);

module.exports = router;
