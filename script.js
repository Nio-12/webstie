class Chatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.closeBtn = document.getElementById('closeBtn');
        
        // Generate a unique session ID for this conversation
        this.sessionId = this.generateSessionId();
        
        // API configuration
        this.apiBaseUrl = 'http://localhost:3000/api';
        
        this.init();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send message to backend API
            const response = await fetch(`${this.apiBaseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
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
    
    // Method to load conversation history (optional feature)
    async loadConversationHistory() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/conversation/${this.sessionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.conversation && data.conversation.length > 0) {
                    // Clear current messages
                    this.chatMessages.innerHTML = '';
                    
                    // Load conversation history
                    data.conversation.forEach(msg => {
                        this.addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
                    });
                }
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }
    
    // Method to clear conversation
    async clearConversation() {
        try {
            await fetch(`${this.apiBaseUrl}/conversation/${this.sessionId}`, {
                method: 'DELETE'
            });
            
            // Clear the chat display
            this.chatMessages.innerHTML = '';
            
            // Add welcome message
            this.addMessage("Hello! I'm your AI assistant. How can I help you today?", 'bot');
            
        } catch (error) {
            console.error('Error clearing conversation:', error);
        }
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
