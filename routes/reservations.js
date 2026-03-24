var express = require('express');
var router = express.Router();

const reservationController = require('../services/reservations')

router.get('/', reservationController.getAllReservations);

module.exports = router;