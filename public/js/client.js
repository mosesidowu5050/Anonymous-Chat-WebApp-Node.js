function generateRandomAlphanumeric(length) {
    const addUserId = Set();

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    let add = ' - CHAT';
    const charactersLength = characters.length;
    for (let count = 0; count < length; count++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    result += add;
    addUserId.add(result);
    
    if( addUserId.has(result)) {
        return generateRandomAlphanumeric(length);
    }

    return result;
}

const userAnonymousId = generateRandomAlphanumeric(4);
console.log(`Your anonymous ID for this session: ${userAnonymousId}`); 

document.getElementById('messageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value();

    if (content.length > 0) {
        sockeet.emit('chat message', {
            content: content,
            userId: userAnonymousId
        });
        messageInput.value = '';
    }
});

//receiving and displaying messages
sockeet.on('chat message', (msg) => {
    const message = document.getElementById('messages');
    const item = document.createElement('li');
    item.textContent = `${msg.userId}: ${msg.content}`;
    message.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
