const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({

    messageId: {
        type: String,
        default: uuidv4,
        unique: true
    },

    content: {
        type: String,
        required: false
    },
}, {
    timestamps: false,
    versionKey: false,
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
