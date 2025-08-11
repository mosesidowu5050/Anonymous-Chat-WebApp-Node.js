io.on('connection', (socket) => {
    console.log('An anonymous user connected');

    socket.on('chat message', async (data) => {
        const { content, anonymousDisplayId } = data;

        if (content === undefined || content === null) {
            console.warn('Received message with undefined/null content. Ignoring.');
            return;
        }

        try {
            const newMessage = new Message({
                content: content 
            });
            await newMessage.save();
            console.log('Message saved to DB:', newMessage);

            io.emit('chat message', { content: content, anonymousDisplayId: anonymousDisplayId });
        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
            socket.emit('error', 'Failed to send message.');
        }
    });

    socket.on('disconnect', () => {
        console.log('An anonymous user disconnected');
    });
});
