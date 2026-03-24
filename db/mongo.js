const mongoose = require('mongoose');

exports.initClientDbConnection = async () => {
    try {
        await mongoose.connect(process.env.URL_MONGODB, {
            dbName: 'api-plaisance'
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};