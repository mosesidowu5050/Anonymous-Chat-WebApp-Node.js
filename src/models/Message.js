const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    content: {
        type: String,
        trim: true
    },
    anonymousDisplayId: {
        type: String,
        required: true,
        trim: true
    },

    avatar: {
        type: String, 
        required: true
    },
    
    color: {
        type: String, 
        required: true
    },

    replyToMessageId: {
        type: String,
        default: null
    },
    replyToContent: {
        type: String,
        default: null,
        trim: true
    },
    replyToDisplayId: {
        type: String,
        default: null,
        trim: true
    },
    replyToAvatar: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false,
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
