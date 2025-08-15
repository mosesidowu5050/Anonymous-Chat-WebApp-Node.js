const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const path = require('path');

const Message = require('./src/models/Message');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
//const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anonymous_chat_db';


const MONGODB_URI = process.env.MONGODB_URI; 
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not set!');
    process.exit(1); 
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, 'public')));
console.log('Serving static files from:', path.join(__dirname, 'public'));


io.on('connection', (socket) => {
    console.log('An anonymous client connected:', socket.id);

    Message.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .then(messages => {
            socket.emit('history', messages.reverse());
        })
        .catch(err => console.error('Error fetching messages:', err));

    socket.on('chat message', async (messageData) => {
        const {
            content,
            anonymousDisplayId,
            avatar,
            color,               
            replyToMessageId,
            replyToContent,
            replyToDisplayId,
            replyToAvatar
        } = messageData;

        if (typeof content !== 'string' || typeof anonymousDisplayId !== 'string' || typeof avatar !== 'string' || typeof color !== 'string') {
            console.warn('Received invalid message data. Ignoring.');
            return;
        }

        try {
            const newMessage = new Message({
                content: content,
                anonymousDisplayId: anonymousDisplayId,
                avatar: avatar,
                color: color, 
                replyToMessageId: replyToMessageId || null,
                replyToContent: replyToContent || null,
                replyToDisplayId: replyToDisplayId || null,
                replyToAvatar: replyToAvatar || null
            });
            const savedMessage = await newMessage.save();
            console.log('Message saved to DB:', savedMessage);

            io.emit('chat message', {
                _id: savedMessage._id.toString(),
                messageId: savedMessage.messageId,
                content: savedMessage.content,
                anonymousDisplayId: savedMessage.anonymousDisplayId,
                avatar: savedMessage.avatar,
                color: savedMessage.color, 
                createdAt: savedMessage.createdAt,
                replyToMessageId: savedMessage.replyToMessageId,
                replyToContent: savedMessage.replyToContent,
                replyToDisplayId: savedMessage.replyToDisplayId,
                replyToAvatar: savedMessage.replyToAvatar
            });
            
            socket.broadcast.emit('stopped typing', { anonymousDisplayId: anonymousDisplayId });

        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
            socket.emit('error', 'Failed to send message. Please try again.');
        }
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('stopped typing', (data) => {
        socket.broadcast.emit('stopped typing', data);
    });

    socket.on('disconnect', () => {
        console.log('An anonymous client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Open your browser at http://localhost:${PORT}`);
});
