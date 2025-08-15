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

document.addEventListener('DOMContentLoaded', () => {
    const anonymousIdSpan = document.getElementById('my-anonymous-id');
    if (anonymousIdSpan) {
        anonymousIdSpan.textContent = `You are: [${userAnonymousId}]`;
    }
});

const socket = io();
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');


messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const content = messageInput.value; 

    if (content !== null && content !== undefined) {
        socket.emit('chat message', { content: content, userAnonymousId: userAnonymousId });
        messageInput.value = ''; 
        messageInput.focus(); 
    }
});


socket.on('chat message', (msg) => {

    const item = document.createElement('li');

    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'bg-blue-100'); 

    const displayedContent = msg.content.trim() === '' ? '[empty message]' : msg.content;
    item.textContent = `[${msg.userAnonymousId}]: ${displayedContent}`;

    messagesList.appendChild(item); 
    messagesList.scrollTop = messagesList.scrollHeight;
});


socket.on('history', (historyMessages) => {
    messagesList.innerHTML = ''; 
    historyMessages.forEach(msg => {
        const item = document.createElement('li');
        item.classList.add('mb-2', 'p-2', 'rounded-lg', 'bg-gray-200', 'text-gray-600', 'text-sm'); 

        const displayedContent = msg.content.trim() === '' ? '[empty message]' : msg.content;
        const timestamp = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        item.textContent = `[History - ${timestamp}]: ${displayedContent}`;
        messagesList.appendChild(item);
    });
    messagesList.scrollTop = messagesList.scrollHeight;
});

socket.on('connect', () => {
    console.log('Connected to server!');
});


socket.on('disconnect', () => {
    console.log('Disconnected from server!');
    const item = document.createElement('li');
    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'bg-red-100', 'text-red-700');
    item.textContent = 'You have been disconnected from the chat.';
    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
    const item = document.createElement('li');
    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'bg-red-100', 'text-red-700');
    item.textContent = `Connection error: ${err.message}. Retrying...`;
    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
});
