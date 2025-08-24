// DOM Elements
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const messagesContainer = document.getElementById('messages-container');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHistory = document.querySelector('.chat-history');

// Chat state
let conversations = [
    {
        id: 1,
        title: 'New conversation',
        messages: [],
        createdAt: new Date().toISOString()
    }
];
let currentChatId = 1;
let messageCounter = 1;
let isTyping = false;

// Initialize the app
function init() {
    updateSendButtonState();
    renderChatHistory();
    showWelcomeMessage();
    loadFromLocalStorage();
    
    // Event listeners
    messageInput.addEventListener('input', handleInputChange);
    messageInput.addEventListener('keydown', handleKeyDown);
    sendBtn.addEventListener('click', sendMessage);
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    newChatBtn.addEventListener('click', createNewChat);
    
    // Profile dropdown functionality
    const dropdownBtn = document.getElementById('profile-dropdown');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });
    }
    
    // Auto-save to localStorage
    setInterval(saveToLocalStorage, 5000);
}

// Local Storage functions
function saveToLocalStorage() {
    localStorage.setItem('chatGPT_conversations', JSON.stringify(conversations));
    localStorage.setItem('chatGPT_currentChatId', currentChatId.toString());
}

function loadFromLocalStorage() {
    const savedConversations = localStorage.getItem('chatGPT_conversations');
    const savedCurrentChatId = localStorage.getItem('chatGPT_currentChatId');
    
    if (savedConversations) {
        conversations = JSON.parse(savedConversations);
        if (conversations.length === 0) {
            conversations = [{
                id: 1,
                title: 'New conversation',
                messages: [],
                createdAt: new Date().toISOString()
            }];
        }
    }
    
    if (savedCurrentChatId) {
        currentChatId = parseInt(savedCurrentChatId);
        if (!conversations.find(chat => chat.id === currentChatId)) {
            currentChatId = conversations[0].id;
        }
    }
    
    renderChatHistory();
    renderCurrentChat();
}

// Handle input changes
function handleInputChange() {
    updateSendButtonState();
    autoResizeTextarea();
}

// Auto-resize textarea with smooth animation
function autoResizeTextarea() {
    const maxHeight = 120;
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, maxHeight);
    messageInput.style.height = newHeight + 'px';
    
    // Add visual feedback for multi-line input
    if (newHeight > 50) {
        messageInput.style.borderRadius = '16px';
    } else {
        messageInput.style.borderRadius = '16px';
    }
}

// Update send button state with visual feedback
function updateSendButtonState() {
    const hasContent = messageInput.value.trim().length > 0;
    sendBtn.disabled = !hasContent || isTyping;
    
    if (hasContent && !isTyping) {
        sendBtn.style.opacity = '1';
        sendBtn.style.transform = 'scale(1)';
    } else {
        sendBtn.style.opacity = '0.5';
        sendBtn.style.transform = 'scale(0.9)';
    }
}

// Handle Enter key with Shift+Enter for new lines
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
            sendMessage();
        }
    }
}

// Send message with FastAPI connection to main.py logic
async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || isTyping) return;

    // Clear welcome message if it exists
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => welcomeMessage.remove(), 300);
    }

    // Add user message with animation
    addMessage('user', content);
    
    // Clear input with smooth animation
    messageInput.style.transform = 'scale(0.98)';
    setTimeout(() => {
        messageInput.value = '';
        messageInput.style.transform = 'scale(1)';
        updateSendButtonState();
        autoResizeTextarea();
    }, 100);
    
    // Set typing state
    isTyping = true;
    updateSendButtonState();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send to your main.py logic via FastAPI
        const response = await fetch('http://localhost:8002/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: content,
                user_name: 'User' // You can make this dynamic later
            })
        });
        
        const data = await response.json();
        console.log('Received data:', data);  // Debug logging
        
        if (response.ok) {
            hideTypingIndicator();
            // Make sure we have a valid response
            const aiResponse = data.response || "No response received";
            console.log('AI Response:', aiResponse);  // Debug logging
            addMessage('assistant', aiResponse);
        } else {
            hideTypingIndicator();
            addMessage('assistant', 'Sorry, there was an error processing your request.');
        }
    } catch (error) {
        hideTypingIndicator();
        addMessage('assistant', 'Sorry, cannot connect to the medical AI service. Please make sure the server is running.');
        console.error('API Error:', error);
    }
    
    isTyping = false;
    updateSendButtonState();
    
    // Update conversation title if it's the first message
    updateConversationTitle(content);
    saveToLocalStorage();
}

// Enhanced message adding with better animations
function addMessage(sender, content, imageUrl = null) {
    const currentChat = conversations.find(chat => chat.id === currentChatId);
    
    const message = {
        id: messageCounter++,
        sender,
        content,
        imageUrl,
        timestamp: new Date().toISOString()
    };
    
    currentChat.messages.push(message);
    renderMessage(message);
    scrollToBottom();
}

// Enhanced message rendering with new bubble structure
function renderMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender}`;
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(30px) scale(0.9)';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = message.sender === 'user' ? 'U' : 'AI';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Add avatar and bubble to message
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageBubble);
    messageBubble.appendChild(content);
    
    // Enhanced text rendering with typing effect for AI messages
    if (message.sender === 'assistant') {
        content.textContent = '';
        messagesContainer.appendChild(messageDiv);
        
        // Animate message appearance
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0) scale(1)';
        }, 100);
        
        // Typing effect for AI responses
        typewriterEffect(content, message.content, 25);
    } else {
        content.textContent = message.content;
        messagesContainer.appendChild(messageDiv);
        
        // Animate message appearance
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0) scale(1)';
        }, 100);
    }
    
    // Add image if present
    if (message.imageUrl) {
        const img = document.createElement('img');
        img.src = message.imageUrl;
        img.className = 'message-image';
        img.alt = 'Uploaded image';
        img.style.opacity = '0';
        img.style.transform = 'scale(0.8)';
        content.appendChild(img);
        
        img.onload = () => {
            setTimeout(() => {
                img.style.transition = 'all 0.5s ease';
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            }, 300);
        };
    }
}

// Typewriter effect for AI responses
function typewriterEffect(element, text, speed = 50) {
    let i = 0;
    const timer = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i > text.length - 1) {
            clearInterval(timer);
        }
        scrollToBottom();
    }, speed);
}

// Enhanced typing indicator with new structure
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.style.opacity = '0';
    typingDiv.style.transform = 'translateY(30px) scale(0.9)';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'typing-dots';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dotsContainer.appendChild(dot);
    }
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(dotsContainer);
    messagesContainer.appendChild(typingDiv);
    
    // Animate typing indicator appearance
    setTimeout(() => {
        typingDiv.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        typingDiv.style.opacity = '1';
        typingDiv.style.transform = 'translateY(0) scale(1)';
    }, 100);
    
    scrollToBottom();
}

// Hide typing indicator with animation
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.transition = 'all 0.3s ease';
        typingIndicator.style.opacity = '0';
        typingIndicator.style.transform = 'translateY(-20px)';
        setTimeout(() => typingIndicator.remove(), 300);
    }
}

// Enhanced AI response generation
function generateAIResponse(userMessage) {
    const responses = [
        "I understand your question. Let me help you with that detailed explanation and provide some context around this topic.",
        "That's an interesting point you've raised. Here's what I think about it based on current knowledge and best practices.",
        "I'd be happy to assist you with this topic. Let me break it down into manageable parts for better understanding.",
        "Based on what you've shared, I can provide some comprehensive insights that should help address your concerns.",
        "Thank you for your thoughtful message. Let me provide you with a detailed response that covers the key aspects.",
        "I appreciate you reaching out with this question. Here's my perspective along with some practical recommendations.",
        "That's a great question that touches on several important concepts! Let me walk you through the details.",
        "I see what you're looking for. Here's some comprehensive information that should help guide your next steps."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addMessage('assistant', randomResponse);
}

// Enhanced file upload with preview
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show upload feedback
    attachBtn.style.transform = 'scale(0.9)';
    attachBtn.style.opacity = '0.7';
    
    setTimeout(() => {
        attachBtn.style.transform = 'scale(1)';
        attachBtn.style.opacity = '1';
    }, 200);
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Clear welcome message if it exists
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => welcomeMessage.remove(), 300);
            }
            
            addMessage('user', `Shared an image: ${file.name}`, e.target.result);
            
            // Enhanced AI response for images
            isTyping = true;
            updateSendButtonState();
            
            setTimeout(() => {
                showTypingIndicator();
            }, 800);
            
            setTimeout(() => {
                hideTypingIndicator();
                const imageResponses = [
                    "I can see the image you've shared. It's quite interesting! How can I help you analyze or work with this image?",
                    "Thanks for sharing this image. I can observe the visual elements present. What would you like to know about it?",
                    "I've received your image successfully. What specific aspects would you like me to help you with regarding this image?",
                    "Great image! I can see the details you've shared. How would you like me to assist you with this?"
                ];
                const randomImageResponse = imageResponses[Math.floor(Math.random() * imageResponses.length)];
                addMessage('assistant', randomImageResponse);
                isTyping = false;
                updateSendButtonState();
            }, 2000);
            
            updateConversationTitle(`Image: ${file.name}`);
            saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    } else {
        // Handle other file types
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => welcomeMessage.remove(), 300);
        }
        
        addMessage('user', `Shared a file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        
        isTyping = true;
        updateSendButtonState();
        
        setTimeout(() => {
            showTypingIndicator();
        }, 500);
        
        setTimeout(() => {
            hideTypingIndicator();
            addMessage('assistant', "I can see you've shared a file. While I can't process all file types directly, I'm here to help you with any questions about it!");
            isTyping = false;
            updateSendButtonState();
        }, 1500);
        
        updateConversationTitle(`File: ${file.name}`);
        saveToLocalStorage();
    }
    
    // Reset file input
    fileInput.value = '';
}

// Enhanced new chat creation
function createNewChat() {
    const newChatId = Date.now();
    const newChat = {
        id: newChatId,
        title: 'New conversation',
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    conversations.unshift(newChat); // Add to beginning
    currentChatId = newChatId;
    
    // Animate button press
    newChatBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        newChatBtn.style.transform = 'scale(1)';
    }, 150);
    
    renderChatHistory();
    clearMessages();
    showWelcomeMessage();
    saveToLocalStorage();
    
    // Focus on input
    setTimeout(() => {
        messageInput.focus();
    }, 300);
}

// Enhanced chat switching with animation
function switchToChat(chatId) {
    if (chatId === currentChatId) return;
    
    currentChatId = chatId;
    
    // Animate chat switch
    messagesContainer.style.opacity = '0';
    messagesContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        renderChatHistory();
        renderCurrentChat();
        
        messagesContainer.style.transition = 'all 0.3s ease';
        messagesContainer.style.opacity = '1';
        messagesContainer.style.transform = 'translateY(0)';
    }, 150);
    
    saveToLocalStorage();
}

// Enhanced chat history rendering with timestamps
function renderChatHistory() {
    chatHistory.innerHTML = '';
    
    // Sort conversations by creation date (newest first)
    const sortedConversations = [...conversations].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedConversations.forEach((chat, index) => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
        chatItem.dataset.chatId = chat.id;
        
        // Create chat content container
        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';
        
        const title = document.createElement('span');
        title.className = 'chat-title';
        title.textContent = chat.title;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'chat-timestamp';
        timestamp.style.fontSize = '11px';
        timestamp.style.color = '#888';
        timestamp.style.marginTop = '4px';
        
        const date = new Date(chat.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            timestamp.textContent = 'Today';
        } else if (diffDays === 2) {
            timestamp.textContent = 'Yesterday';
        } else if (diffDays <= 7) {
            timestamp.textContent = `${diffDays - 1} days ago`;
        } else {
            timestamp.textContent = date.toLocaleDateString();
        }
        
        chatContent.appendChild(title);
        chatContent.appendChild(timestamp);
        
        // Create delete button (only show if more than 1 conversation)
        if (conversations.length > 1) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'chat-delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = 'Delete conversation';
            
            // Add delete button click handler
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent chat selection
                deleteChatWithConfirmation(chat.id);
            });
            
            chatItem.appendChild(deleteBtn);
        }
        
        chatItem.appendChild(chatContent);
        
        // Add click handler with animation (only on chat content, not delete button)
        chatContent.addEventListener('click', (e) => {
            e.currentTarget.parentElement.style.transform = 'scale(0.98)';
            setTimeout(() => {
                e.currentTarget.parentElement.style.transform = 'scale(1)';
                switchToChat(chat.id);
            }, 100);
        });
        
        // Add delete functionality (right-click or long press)
        chatItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (conversations.length > 1) {
                deleteChatWithConfirmation(chat.id);
            }
        });
        
        chatHistory.appendChild(chatItem);
        
        // Animate item appearance
        setTimeout(() => {
            chatItem.style.opacity = '1';
            chatItem.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// Delete chat with confirmation
function deleteChatWithConfirmation(chatId) {
    if (confirm('Are you sure you want to delete this conversation?')) {
        conversations = conversations.filter(chat => chat.id !== chatId);
        
        if (currentChatId === chatId) {
            currentChatId = conversations[0].id;
            renderCurrentChat();
        }
        
        renderChatHistory();
        saveToLocalStorage();
    }
}

// Enhanced welcome message
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.style.opacity = '0';
    welcomeDiv.style.transform = 'translateY(20px)';
    
    const title = document.createElement('h2');
    title.textContent = 'How can I help you today?';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Start a conversation, upload an image, or ask me anything!';
    subtitle.style.marginTop = '8px';
    
    welcomeDiv.appendChild(title);
    welcomeDiv.appendChild(subtitle);
    messagesContainer.appendChild(welcomeDiv);
    
    // Animate welcome message
    setTimeout(() => {
        welcomeDiv.style.transition = 'all 0.6s ease';
        welcomeDiv.style.opacity = '1';
        welcomeDiv.style.transform = 'translateY(0)';
    }, 200);
}

// Smooth scroll to bottom
function scrollToBottom() {
    const scrollContainer = messagesContainer;
    const scrollAnimation = () => {
        scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
        });
    };
    
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(scrollAnimation);
}

// Enhanced conversation title update
function updateConversationTitle(firstMessage) {
    const currentChat = conversations.find(chat => chat.id === currentChatId);
    
    if (currentChat.messages.length === 1) {
        let title = firstMessage.length > 35 
            ? firstMessage.substring(0, 35) + '...' 
            : firstMessage;
            
        // Clean up title
        title = title.replace(/\n/g, ' ').trim();
        
        currentChat.title = title;
        renderChatHistory();
    }
}

// Render current chat messages
function renderCurrentChat() {
    clearMessages();
    
    const currentChat = conversations.find(chat => chat.id === currentChatId);
    
    if (currentChat.messages.length === 0) {
        showWelcomeMessage();
    } else {
        currentChat.messages.forEach(message => {
            renderMessage(message);
        });
        scrollToBottom();
    }
}

// Clear all messages
function clearMessages() {
    messagesContainer.innerHTML = '';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
    setTimeout(loadProfileData, 100); // Small delay to ensure elements are loaded
});
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('avatar-img').src = e.target.result;
                localStorage.setItem('userAvatar', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function changeUsername() {
    const currentName = document.querySelector('.username').textContent;
    const newName = prompt('Enter your new username:', currentName);
    if (newName && newName.trim()) {
        document.querySelector('.username').textContent = newName.trim();
        localStorage.setItem('username', newName.trim());
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
        localStorage.removeItem('chatGPT_conversations');
        localStorage.removeItem('chatGPT_currentChatId');
        location.reload(); // Refresh page to reset state
    }
}

function exportChat() {
    const chatData = {
        conversations: conversations,
        exportDate: new Date().toISOString(),
        user: document.querySelector('.username').textContent
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `medilink-chat-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Load saved profile data
function loadProfileData() {
    const savedUsername = localStorage.getItem('username');
    const savedAvatar = localStorage.getItem('userAvatar');
    
    if (savedUsername) {
        document.querySelector('.username').textContent = savedUsername;
    }
    
    if (savedAvatar) {
        document.getElementById('avatar-img').src = savedAvatar;
    }
}

// Add some CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .chat-timestamp {
        transition: color 0.2s ease;
    }
    
    .chat-item:hover .chat-timestamp {
        color: #bbb !important;
    }
    
    .message-input {
        transition: all 0.3s ease !important;
    }
    
    .input-buttons button {
        transition: all 0.2s ease !important;
    }
`;
document.head.appendChild(style);
