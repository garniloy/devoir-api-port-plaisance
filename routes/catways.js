var express = require('express');
var router = express.Router();
const catwayController = require('../services/catways');
const reservationController = require('../services/reservations')


router.post('/', catwayController.createCatway);
router.get('/', catwayController.getAllCatways);
router.get('/:catwayNumber', catwayController.getCatway);
router.put('/:catwayNumber', catwayController.updateCatway);
router.delete('/:catwayNumber', catwayController.deleteCatway);

/* reservation roads */

// GET all reservations for a catway
router.get('/:id/reservations', reservationController.getReservations);

// GET one reservation
router.get('/:id/reservations/:idReservation', reservationController.getReservation);

// CREATE reservation
router.post('/:id/reservations', reservationController.createReservation);

// UPDATE reservation
router.put('/:id/reservations/:idReservation', reservationController.updateReservation);

// DELETE reservation
router.delete('/:id/reservations/:idReservation', reservationController.deleteReservation);

module.exports = router;