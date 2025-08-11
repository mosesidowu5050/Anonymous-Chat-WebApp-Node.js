const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    passwordHash: {
        type: String,
        required: true
    },
}, {
    timestamps: true 
})


    UserSchema.pre('save', async function(next) {
        if (this.isModified('password')) {
            try {
                const salt = await bcrypt.genSalt(10);
                this.password = await bcrypt.hash(this.password, salt);
            } catch (err) {
                return next(err);
            }
        }
    });

const User = mongoose.model('User', UserSchema);

module.exports = User;