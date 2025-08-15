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

let myGeneratedAvatarSvg = '';

const receiverColors = [
    'bg-blue-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-purple-200',
    'bg-red-200',
    'bg-teal-200',
    'bg-pink-200',
    'bg-lime-200',
    'bg-orange-200'
];

let myMessageBackgroundColorClass = receiverColors[Math.floor(Math.random() * receiverColors.length)];
console.log(`Your message color will be: ${myMessageBackgroundColorClass}`);

let currentReplyToMessage = null;

let typingTimeout;
let isTyping = false;
const TYPING_TIMEOUT_MILLISECONDS = 1500; 
const currentlyTypingUsers = new Map();

const welcomeScreen = document.getElementById('welcome-screen');
const welcomeAnonymousIdSpan = document.getElementById('welcome-anonymous-id');
const welcomeAvatarDisplayDiv = document.getElementById('welcome-avatar-display');
const startChatButton = document.getElementById('start-chat-button');
const chatContainerWrapper = document.getElementById('chat-container-wrapper');


document.addEventListener('DOMContentLoaded', () => {
    const anonymousIdSpan = document.getElementById('my-anonymous-id');
    const myAvatarDisplayDiv = document.getElementById('my-avatar-display');

    if (anonymousIdSpan) {
        anonymousIdSpan.textContent = `[${myAnonymousDisplayId}]`;
    }

    if (typeof jdenticon !== 'undefined') {
        myGeneratedAvatarSvg = jdenticon.toSvg(myAnonymousDisplayId, 40); 
        
        if (myAvatarDisplayDiv) {
            myAvatarDisplayDiv.innerHTML = myGeneratedAvatarSvg;
        }

        if (welcomeAnonymousIdSpan && welcomeAvatarDisplayDiv) {
            welcomeAnonymousIdSpan.textContent = `[${myAnonymousDisplayId}]`;
            welcomeAvatarDisplayDiv.innerHTML = jdenticon.toSvg(myAnonymousDisplayId, 100); 
        }
        console.log('Generated and displayed my avatar SVG.');
    } else {
        console.error('Jdenticon library not loaded. Avatars will not display.');
    }

    document.getElementById('clear-reply').addEventListener('click', clearReplyContext);

    if (startChatButton) {
        startChatButton.addEventListener('click', () => {
            welcomeScreen.classList.remove('opacity-100');
            welcomeScreen.classList.add('opacity-0');
            welcomeScreen.classList.add('pointer-events-none'); 

            chatContainerWrapper.classList.remove('opacity-0', 'pointer-events-none');
            chatContainerWrapper.classList.add('opacity-100');

        });
    }


    if (messageInput) {
        messageInput.addEventListener('input', () => {
            if (!isTyping) {
                isTyping = true;
                socket.emit('typing', {
                    anonymousDisplayId: myAnonymousDisplayId,
                    avatar: myGeneratedAvatarSvg,
                    color: myMessageBackgroundColorClass
                });
            }
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                isTyping = false;
                socket.emit('stopped typing', { anonymousDisplayId: myAnonymousDisplayId });
            }, TYPING_TIMEOUT_MILLISECONDS);
        });
    }
});





const socket = io();

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');
const replyContextDiv = document.getElementById('reply-context');
const replyToDisplayIdSpan = document.getElementById('reply-to-display-id');
const replyToContentP = document.getElementById('reply-to-content');
const replyAvatarDiv = replyContextDiv.querySelector('.reply-avatar');
const typingIndicatorDiv = document.getElementById('typing-indicator'); 


/**
 * @param {object} msg - The message object to reply to.
 */
function setReplyContext(msg) {
    currentReplyToMessage = msg;
    replyToDisplayIdSpan.textContent = `[${msg.anonymousDisplayId}]`;
    replyToContentP.textContent = msg.content.length > 50 ? 
    msg.content.substring(0, 47) + '...' : msg.content;
    
    if (replyAvatarDiv && typeof jdenticon !== 'undefined' && msg.anonymousDisplayId) {
        replyAvatarDiv.innerHTML = jdenticon.toSvg(msg.anonymousDisplayId, 20);
    } else {
        replyAvatarDiv.innerHTML = '';
    }

    replyContextDiv.classList.remove('hidden');
    messageInput.focus();
}


function clearReplyContext() {
    currentReplyToMessage = null;
    replyContextDiv.classList.add('hidden');
    replyToDisplayIdSpan.textContent = '';
    replyToContentP.textContent = '';
    replyAvatarDiv.innerHTML = '';
}


function updateTypingIndicator() {
    if (currentlyTypingUsers.size === 0) {
        typingIndicatorDiv.classList.add('hidden');
        typingIndicatorDiv.innerHTML = '';
        return;
    }

    typingIndicatorDiv.classList.remove('hidden');
    const typingUsersArray = Array.from(currentlyTypingUsers.values()); 

    let indicatorHtml = '';
    if (typingUsersArray.length === 1) {
        const user = typingUsersArray[0];
        const userAvatarHtml = (typeof jdenticon !== 'undefined' && user.anonymousDisplayId) ?
                                jdenticon.toSvg(user.anonymousDisplayId, 20) :
                                `<div class="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">?</div>`;
        indicatorHtml = `<div class="flex items-center justify-center space-x-2">
                            <div class="message-avatar w-5 h-5 rounded-full overflow-hidden">${userAvatarHtml}</div>
                            <span>[${user.anonymousDisplayId}] is typing...</span>
                         </div>`;
    } else if (typingUsersArray.length === 2) {
        const user1 = typingUsersArray[0];
        const user2 = typingUsersArray[1];
        const user1AvatarHtml = (typeof jdenticon !== 'undefined' && user1.anonymousDisplayId) ?
                                jdenticon.toSvg(user1.anonymousDisplayId, 20) : `<div class="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">?</div>`;
        const user2AvatarHtml = (typeof jdenticon !== 'undefined' && user2.anonymousDisplayId) ?
                                jdenticon.toSvg(user2.anonymousDisplayId, 20) : `<div class="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">?</div>`;
        indicatorHtml = `<div class="flex items-center justify-center space-x-2">
                            <div class="message-avatar w-5 h-5 rounded-full overflow-hidden">${user1AvatarHtml}</div>
                            <span>[${user1.anonymousDisplayId}]</span>,
                            <div class="message-avatar w-5 h-5 rounded-full overflow-hidden">${user2AvatarHtml}</div>
                            <span>[${user2.anonymousDisplayId}] are typing...</span>
                         </div>`;
    } else {
        indicatorHtml = `${typingUsersArray.length} users are typing...`;
    }
    typingIndicatorDiv.innerHTML = indicatorHtml;
    messagesList.scrollTop = messagesList.scrollHeight; 
}


/**
 * @param {object} msg - The message object containing content, anonymousDisplayId, avatar, color, and replyTo fields.
 * @param {boolean} isHistory - True if this message is from history, false otherwise.
 */
function appendMessage(msg, isHistory = false) {
    const item = document.createElement('li');
    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'relative', 'max-w-[80%]', 'message-bubble');

    const displayedContent = msg.content.trim() === '' ? '[empty message]' : msg.content;
    const timestamp = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageAvatarHtml = (typeof jdenticon !== 'undefined' && msg.anonymousDisplayId) ?
                              jdenticon.toSvg(msg.anonymousDisplayId, 40) :
                              `<div class="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">?</div>`;


    let messageHtml = '';

    const isMyMessage = msg.anonymousDisplayId === myAnonymousDisplayId;

    let replyContextHtml = '';
    if (msg.replyToMessageId && msg.replyToContent && msg.replyToDisplayId) {
        const replyToAvatarHtml = (typeof jdenticon !== 'undefined' && msg.replyToDisplayId) ?
                                  jdenticon.toSvg(msg.replyToDisplayId, 20) :
                                  `<div class="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">?</div>`;
        replyContextHtml = `
            <div class="bg-gray-100 p-2 rounded-lg mb-2 text-xs text-gray-700 border-l-4 border-indigo-400">
                <div class="flex items-center space-x-1 mb-1">
                    <div class="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">${replyToAvatarHtml}</div>
                    <span class="font-semibold text-indigo-700">[${msg.replyToDisplayId}]</span>
                </div>
                <p class="truncate text-gray-600">${msg.replyToContent}</p>
            </div>
        `;
    }

    if (isMyMessage) {
        item.classList.add('bg-indigo-500', 'text-white', 'ml-auto');
        messageHtml = `
            ${replyContextHtml}
            <div class="flex items-center justify-end space-x-2 mb-1">
                <span class="text-xs text-indigo-100 opacity-80">You (${timestamp})</span>
                <div class="message-avatar w-6 h-6 rounded-full overflow-hidden">${messageAvatarHtml}</div>
            </div>
            ${displayedContent}
            <button class="reply-button" data-message-id="${msg.messageId}" data-content="${msg.content}" data-display-id="${msg.anonymousDisplayId}" data-avatar="${msg.avatar}">Reply</button>
        `;
    } else {
        const receivedBgColor = msg.color || 'bg-gray-200';
        item.classList.add(receivedBgColor, 'text-gray-800', 'mr-auto'); 
        messageHtml = `
            ${replyContextHtml}
            <div class="flex items-center space-x-2 mb-1">
                <div class="message-avatar w-6 h-6 rounded-full overflow-hidden">${messageAvatarHtml}</div>
                <span class="text-xs text-gray-500">${msg.anonymousDisplayId} (${timestamp})</span>
            </div>
            ${displayedContent}
            <button class="reply-button" data-message-id="${msg.messageId}" data-content="${msg.content}" data-display-id="${msg.anonymousDisplayId}" data-avatar="${msg.avatar}">Reply</button>
        `;
    }

    item.innerHTML = messageHtml;
    messagesList.appendChild(item);

    const replyButton = item.querySelector('.reply-button');
    if (replyButton) {
        replyButton.addEventListener('click', () => {
            const replyMsg = {
                messageId: replyButton.dataset.messageId,
                content: replyButton.dataset.content,
                anonymousDisplayId: replyButton.dataset.displayId,
                avatar: replyButton.dataset.avatar
            };
            setReplyContext(replyMsg);
        });
    }

    messagesList.scrollTop = messagesList.scrollHeight;
}



messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const content = messageInput.value;

    if (content !== null && content !== undefined) {
        const messageData = {
            content: content,
            anonymousDisplayId: myAnonymousDisplayId,
            avatar: myGeneratedAvatarSvg,
            color: myMessageBackgroundColorClass
        };

        if (currentReplyToMessage) {
            messageData.replyToMessageId = currentReplyToMessage.messageId;
            messageData.replyToContent = currentReplyToMessage.content;
            messageData.replyToDisplayId = currentReplyToMessage.anonymousDisplayId;
            messageData.replyToAvatar = currentReplyToMessage.avatar;
        }

        socket.emit('chat message', messageData);
        messageInput.value = '';
        messageInput.focus();
        clearReplyContext(); 

        clearTimeout(typingTimeout);
        if (isTyping) {
            isTyping = false;
            socket.emit('stopped typing', { anonymousDisplayId: myAnonymousDisplayId });
        }
    }
});




function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const appTitleFromParam = getQueryParam('appTitle');
const logoUrlFromParam = getQueryParam('logoUrl');

const defaultBrowserTitle = 'Anonymous Chat';
const defaultChatHeaderTitle = 'Anonymous Chat'; 
const defaultFaviconPath = '/img/log.png'; 

if (appTitleFromParam) {
    document.title = appTitleFromParam;
} else {
    document.title = defaultBrowserTitle;
}


const faviconLinkElement = document.getElementById('faviconLink');
if (faviconLinkElement) {
    if (logoUrlFromParam) {
        faviconLinkElement.href = logoUrlFromParam;
        faviconLinkElement.onerror = () => {
            console.error('Failed to load favicon from URL:', logoUrlFromParam);
            faviconLinkElement.href = defaultFaviconPath; 
        };
    } else {
        faviconLinkElement.href = defaultFaviconPath;
    }
} else {
    let link = document.createElement('link');
    link.id = 'faviconLink';
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = logoUrlFromParam || defaultFaviconPath;
    document.head.appendChild(link);
}

const chatHeaderTitleElement = document.getElementById('chatHeaderTitle');
if (chatHeaderTitleElement) {
    if (appTitleFromParam) {
        chatHeaderTitleElement.textContent = appTitleFromParam;
    } else {
        chatHeaderTitleElement.textContent = defaultChatHeaderTitle;
    }
}



socket.on('chat message', (msg) => {
    appendMessage(msg, false); 
    currentlyTypingUsers.delete(msg.anonymousDisplayId);
    updateTypingIndicator();
});

socket.on('history', (historyMessages) => {
    messagesList.innerHTML = ''; 
    historyMessages.forEach(msg => {
        appendMessage(msg, false); 
    });
    messagesList.scrollTop = messagesList.scrollHeight;
});


socket.on('typing', (data) => {
    if (data.anonymousDisplayId !== myAnonymousDisplayId) { 
        currentlyTypingUsers.set(data.anonymousDisplayId, {
            anonymousDisplayId: data.anonymousDisplayId,
            avatar: data.avatar,
            color: data.color
        });
        updateTypingIndicator();
    }
});

socket.on('stopped typing', (data) => {
    if (data.anonymousDisplayId !== myAnonymousDisplayId) { 
        currentlyTypingUsers.delete(data.anonymousDisplayId);
        updateTypingIndicator();
    }
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

    currentlyTypingUsers.clear();
    updateTypingIndicator();
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
    const item = document.createElement('li');
    item.classList.add('mb-2', 'p-2', 'rounded-lg', 'bg-red-100', 'text-red-700', 'mx-auto');
    item.textContent = `Connection error😒 Retrying...`;
    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
});
