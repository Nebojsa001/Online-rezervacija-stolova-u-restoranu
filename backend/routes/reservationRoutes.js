const express = require("express");
const reservationController = require("../controllers/reservationController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .post(authController.protect, reservationController.createReservation)
  .get(reservationController.getAllReservations)
  .delete(authController.protect, reservationController.deleteReservation);

router
  .route("/free-reservations")
  .get(reservationController.getAllFreeReservations);

module.exports = router;
