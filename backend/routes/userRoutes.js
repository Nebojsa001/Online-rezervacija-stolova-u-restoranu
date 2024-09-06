const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.patch(
  "/promote-to-waiter/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.promoteToWaiter
);

router.delete(
  "/delete-user/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);

module.exports = router;
