const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Message = require('/src/models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', (socket) => {
    console.log('An anonymous user connected', socket.id);

Message.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .then(messages => {
        socket.emit('previousMessages', messages.reverse());
    })
    .catch(err => console.error('Error fetching messages:', err));

    socket.on('sendMessage', async (messageContent) => {
        const { content, anonymousUserId } = messageContent;

    try {
            const newMessage = new Message({
                content: content
            });
            await newMessage.save();
            console.log('Message saved to DB:', newMessage);

            // Broadcast to all clients
            io.emit('chat message', {
                content: content,
                anonymousUserId: anonymousUserId
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
