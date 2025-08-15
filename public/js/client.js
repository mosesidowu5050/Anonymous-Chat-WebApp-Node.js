function generateRandomAlphanumeric(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const myAnonymousDisplayId = generateRandomAlphanumeric(4);
console.log(`Your anonymous ID for this session: [${myAnonymousDisplayId}]`);

document.addEventListener('DOMContentLoaded', () => {
    const anonymousIdSpan = document.getElementById('my-anonymous-id');
    if (anonymousIdSpan) {
        anonymousIdSpan.textContent = `[${myAnonymousDisplayId}]`;
    }
});


const socket = io(); 

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');

/**
 * @param {object} msg 
 * @param {boolean} isHistory
 */
function appendMessage(msg, isHistory = false) {
    const item = document.createElement('li');
    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'relative', 'max-w-[80%]'); 

    const displayedContent = msg.content.trim() === '' ? '[empty message]' : msg.content;
    const timestamp = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isHistory) {
        item.classList.add('bg-gray-200', 'text-gray-600', 'text-sm', 'mx-auto', 'text-center');
        item.innerHTML = `<span class="block text-xs text-gray-500 mb-1">History - ${timestamp}</span>${displayedContent}`;
    } else {
        const isMyMessage = msg.anonymousDisplayId === myAnonymousDisplayId;

        if (isMyMessage) {
            item.classList.add('bg-indigo-500', 'text-white', 'ml-auto'); 
            item.innerHTML = `
                <span class="block text-xs text-indigo-100 opacity-80 mb-1 text-right">You (${timestamp})</span>
                ${displayedContent}
            `;
        } else {
            item.classList.add('bg-gray-200', 'text-gray-800', 'mr-auto'); 
            item.innerHTML = `
                <span class="block text-xs text-gray-500 mb-1">${msg.anonymousDisplayId} (${timestamp})</span>
                ${displayedContent}
            `;
        }
    }

    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
}


messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); // 

    const content = messageInput.value; 

    if (content !== null && content !== undefined) {
        socket.emit('chat message', { content: content, anonymousDisplayId: myAnonymousDisplayId });
        messageInput.value = ''; 
        messageInput.focus(); 
    }
});

socket.on('chat message', (msg) => {
    appendMessage(msg, false); 
});

socket.on('history', (historyMessages) => {
    messagesList.innerHTML = ''; 
    historyMessages.forEach(msg => {
        appendMessage(msg, true); 
    });
    messagesList.scrollTop = messagesList.scrollHeight;
});

socket.on('connect', () => {
    console.log('Connected to server!');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server!');
    const item = document.createElement('li');
    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'bg-red-100', 'text-red-700', 'mx-auto');
    item.textContent = 'You have been disconnected from the chat.';
    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
    const item = document.createElement('li');
    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'bg-red-100', 'text-red-700', 'mx-auto');
    item.textContent = `Connection error: ${err.message}. Retrying...`;
    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
});
