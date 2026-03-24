const Reservation = require('../models/reservations');
const Catway = require('../models/cateways');

exports.createReservation = async (req, res) => {
    try {
        const catwayNumber = req.params.id;
        const { clientName, boatName, startDate, endDate } = req.body;

       
        const catway = await Catway.findOne({ catwayNumber });
        if (!catway) {
            return res.status(404).json({ message: "Catway not found" });
        }

        
        const conflict = await Reservation.findOne({
            catwayNumber,
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (conflict) {
            return res.status(400).json({
                message: "Catway already reserved for this period"
            });
        }

        const reservation = await Reservation.create({
            catwayNumber,
            clientName,
            boatName,
            startDate,
            endDate
        });

        res.status(201).json(reservation);

    } catch (error) {
        res.status(500).json({
            message: "Error creating reservation",
            error: error.message
        });
    }
};


exports.getReservations = async (req, res) => {
    try {
        const catwayNumber = req.params.id;

        const reservations = await Reservation.find({ catwayNumber });

        res.status(200).json(reservations);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching reservations",
            error: error.message
        });
    }
};


exports.getReservation = async (req, res) => {
    try {
        const { id, idReservation } = req.params;

        const reservation = await Reservation.findOne({
            _id: idReservation,
            catwayNumber: id
        });

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found"
            });
        }

        res.json(reservation);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching reservation",
            error: error.message
        });
    }
};



exports.updateReservation = async (req, res) => {
    try {
        const { id, idReservation } = req.params;

        const updateData = { ...req.body };

        const reservation = await Reservation.findOneAndUpdate(
            { _id: idReservation, catwayNumber: id },
            updateData,
            { returnDocument: 'after' }
        );

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found"
            });
        }

        res.json(reservation);

    } catch (error) {
        res.status(500).json({
            message: "Error updating reservation",
            error: error.message
        });
    }
};


exports.deleteReservation = async (req, res) => {
    try {
        const { id, idReservation } = req.params;

        const reservation = await Reservation.findOneAndDelete({
            _id: idReservation,
            catwayNumber: id
        });

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found"
            });
        }

        res.json({
            message: "Reservation deleted",
            reservation
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting reservation",
            error: error.message
        });
    }
};


exports.getAllReservations = async (req, res) => {
    try {
        const { date } = req.query;
        if (date && isNaN(new Date(date))) {
            return res.status(400).json({
                message: "Invalid date format"
            });
        }
        let filter = {};

        if (date) {
            const start = new Date(date);
            const end = new Date(date);

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            filter = {
                startDate: { $lte: end },
                endDate: { $gte: start }
            };
        }

        const reservations = await Reservation.find(filter);

        res.json(reservations);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching reservations",
            error: error.message
        });
    }
};