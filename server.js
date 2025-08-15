const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Message = require('./src/models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anonymous_chat_db';

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

    // --- Incoming Message Event: Changed 'sendMessage' to 'chat message' to match client.js ---
    socket.on('chat message', async (messageData) => { 
        const { content, anonymousDisplayId } = messageData; 

        // Basic server-side validation: ensure content is a string
        if (typeof content !== 'string') {
            console.warn('Received invalid message content type. Ignoring.');
            return;
        }

        try {
            const newMessage = new Message({
                content: content
            });
            await newMessage.save();
            console.log('Message saved to DB:', newMessage);

            io.emit('chat message', {
                content: content,
                anonymousDisplayId: anonymousDisplayId 
            });
        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
            socket.emit('error', 'Failed to send message. Please try again.');
        }
    });

    socket.on('disconnect', () => {
        console.log('An anonymous client disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Open your browser at http://localhost:${PORT}`);
});
