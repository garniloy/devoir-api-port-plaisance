const Catway = require('../models/cateways');

exports.createCatway = async (req, res) => {
    const { catwayNumber, catwayType, catwayState } = req.body;

    try {
       
        const catway = await Catway.create({
            catwayNumber,
            catwayType,
            catwayState
        });

        res.status(201).json(catway);

    } catch (error) {
        const catwaysList = await Catway.find();
        if(catwaysList.length >= catwayNumber){
            res.status(500).json({
                issue: "No processible action",
                details: "This number of catway already exist the actual last number is "+ catwaysList.length +" so you can create number from "+ (catwaysList.length + 1)
            });
        };
        res.status(400).json({
            issue: "Bad request",
            details: error.message
        });
    }
};

exports.getAllCatways = async (req, res) => {
    try {
        const catways = await Catway.find();

        if (catways.length === 0) {
            return res.status(404).json({
                issue: "Database error",
                details: "No catways found"
            });
        }

        res.status(200).json(catways);

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.getCatway = async (req, res) => {
    try {
        const catway = await Catway.findOne({
            catwayNumber: req.params.catwayNumber
        });

        if (!catway) {
            return res.status(404).json({
                issue: "Database error",
                details: "Catway not found"
            });
        }

        res.status(200).json(catway);

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};


exports.updateCatway = async (req, res) => {
    try {
        const { catwayType, catwayState } = req.body;

        const updateData = {};

        if (catwayType) updateData.catwayType = catwayType;
        if (catwayState) updateData.catwayState = catwayState;

        const catway = await Catway.findOneAndUpdate(
            { catwayNumber: req.params.catwayNumber },
            updateData,
            { returnDocument: 'after' }
        );

        if (!catway) {
            return res.status(404).json({
                message: "Catway not found"
            });
        }

        res.json(catway);

    } catch (error) {
        res.status(500).json({
            message: "Error updating catway",
            error: error.message
        });
    }
};


exports.deleteCatway = async (req, res) => {
    try {
        const catway = await Catway.findOneAndDelete({
            catwayNumber: req.params.catwayNumber
        });

        if (!catway) {
            return res.status(404).json({
                message: "Catway not found"
            });
        }

        res.json({
            message: "Catway deleted",
            catway
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting catway",
            error: error.message
        });
    }
};