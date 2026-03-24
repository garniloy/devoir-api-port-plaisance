const mongoose = require('mongoose');

const bcrypt = require('bcrypt')
const Schem = mongoose.Schema;


const User = new Schem({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

User.pre('save', async function () {
    if (!this.isModified('password')) {
        return next();
    }
    try {
      
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        console.log('erreur');
    }
});

module.exports = mongoose.model('User', User);
