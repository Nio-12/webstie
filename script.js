class Chatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.closeBtn = document.getElementById('closeBtn');
        
        this.botResponses = [
            "That's an interesting question! Let me think about that for a moment.",
            "I understand what you're asking. Here's what I can tell you about that.",
            "Great question! Based on my knowledge, I can help you with that.",
            "I'm here to help! Let me provide you with some information on that topic.",
            "Thanks for asking! Here's what I know about that subject.",
            "I appreciate your question. Let me give you a detailed response.",
            "That's a good point! Let me share some insights with you.",
            "I'm glad you asked that. Here's what I can tell you.",
            "Interesting perspective! Let me add some thoughts to that.",
            "I'd be happy to help you with that. Here's my response."
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.scrollToBottom();
    }
    
    bindEvents() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Enable/disable send button based on input
        this.messageInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.messageInput.value.trim();
        });
        
        // Header buttons
        this.minimizeBtn.addEventListener('click', () => this.minimizeChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        
        // Auto-focus input on load
        this.messageInput.focus();
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate bot thinking time
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateBotResponse(message);
        }, 1500 + Math.random() * 1000);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = text;
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    generateBotResponse(userMessage) {
        // Simple keyword-based responses
        let response = this.getRandomResponse();
        
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = "Hello! It's great to meet you. How can I assist you today?";
        } else if (lowerMessage.includes('how are you')) {
            response = "I'm doing well, thank you for asking! I'm here and ready to help you with any questions you might have.";
        } else if (lowerMessage.includes('name')) {
            response = "I'm an AI assistant, designed to help answer your questions and provide information. What would you like to know?";
        } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
            response = "I'm here to help! I can answer questions, provide information, and assist with various topics. What do you need help with?";
        } else if (lowerMessage.includes('thank')) {
            response = "You're very welcome! I'm happy to help. Is there anything else you'd like to know?";
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            response = "Goodbye! It was nice chatting with you. Feel free to come back anytime if you have more questions!";
        } else if (lowerMessage.includes('weather')) {
            response = "I don't have access to real-time weather data, but I can help you find weather information or answer other questions!";
        } else if (lowerMessage.includes('time')) {
            response = `The current time is ${this.getCurrentTime()}. Is there anything specific you'd like to know about time management?`;
        } else if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
            response = "I'm more focused on being helpful than funny, but I do my best to keep our conversations engaging! What else can I help you with?";
        }
        
        this.addMessage(response, 'bot');
    }
    
    getRandomResponse() {
        return this.botResponses[Math.floor(Math.random() * this.botResponses.length)];
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${ampm}`;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    minimizeChat() {
        const container = document.querySelector('.chatbot-container');
        container.style.transform = 'scale(0.8)';
        container.style.opacity = '0.5';
        
        setTimeout(() => {
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
        }, 200);
    }
    
    closeChat() {
        const container = document.querySelector('.chatbot-container');
        container.style.transform = 'scale(0.8)';
        container.style.opacity = '0';
        
        setTimeout(() => {
            alert('Chat closed! Refresh the page to restart the conversation.');
        }, 300);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add click sound effect (optional)
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.addEventListener('click', () => {
        // You can add a subtle animation or sound here
        sendBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            sendBtn.style.transform = 'scale(1)';
        }, 100);
    });
    
    // Add hover effects for messages
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.message')) {
            e.target.closest('.message').style.transform = 'translateX(2px)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.message')) {
            e.target.closest('.message').style.transform = 'translateX(0)';
        }
    });
});
