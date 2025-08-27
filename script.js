// Chatbot functionality
class Chatbot {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.quickReplies = document.querySelectorAll('.quick-reply');
        
        // Generate a unique session ID for this conversation
        this.sessionId = this.generateSessionId();
        
        // API configuration
        this.apiUrl = 'http://localhost:3000/api';
        
        // Fallback responses for when API is not available
        this.fallbackResponses = {
            'hello': 'Hello! How can I assist you today?',
            'hi': 'Hi there! Nice to meet you!',
            'how are you': 'I\'m doing great, thank you for asking! How about you?',
            'what can you help me with': 'I can help you with various tasks like answering questions, providing information, telling jokes, and having general conversations. Just ask me anything!',
            'tell me a joke': 'Why don\'t scientists trust atoms? Because they make up everything! 😄',
            'what\'s the weather like': 'I\'m sorry, I don\'t have access to real-time weather data. You might want to check a weather app or website for current conditions!',
            'weather': 'I\'m sorry, I don\'t have access to real-time weather data. You might want to check a weather app or website for current conditions!',
            'bye': 'Goodbye! Have a great day! 👋',
            'goodbye': 'See you later! Take care! 👋',
            'thanks': 'You\'re welcome! Is there anything else I can help you with?',
            'thank you': 'You\'re welcome! Is there anything else I can help you with?',
            'help': 'I\'m here to help! You can ask me questions, request jokes, or just chat. What would you like to know?',
            'what is your name': 'My name is AI Assistant! Nice to meet you!',
            'who are you': 'I\'m an AI Assistant designed to help you with various tasks and conversations.',
            'default': 'I\'m not sure how to respond to that. Could you try asking something else?'
        };
        
        this.init();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        this.quickReplies.forEach(button => {
            button.addEventListener('click', async (e) => {
                const message = e.target.dataset.message;
                this.messageInput.value = message;
                await this.sendMessage();
            });
        });
        
        // Focus on input when page loads
        this.messageInput.focus();
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Try to get response from OpenAI API
            const response = await this.getBotResponseFromAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('API Error:', error);
            this.hideTypingIndicator();
            
            // Fallback to local responses
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage(fallbackResponse, 'bot');
            
            // Show error notification
            this.showErrorNotification('API connection failed. Using fallback responses.');
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'bot') {
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
        } else {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        }
        
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
    
    async getBotResponseFromAPI(message) {
        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('API Error Details:', error);
            throw error;
        }
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for exact matches first
        for (const [key, response] of Object.entries(this.fallbackResponses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        // Check for common patterns
        if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
            return 'Why did the scarecrow win an award? Because he was outstanding in his field! 🌾';
        }
        
        if (lowerMessage.includes('time')) {
            return `The current time is ${new Date().toLocaleTimeString()}.`;
        }
        
        if (lowerMessage.includes('date')) {
            return `Today is ${new Date().toLocaleDateString()}.`;
        }
        
        if (lowerMessage.includes('name')) {
            return 'My name is AI Assistant! What\'s your name?';
        }
        
        if (lowerMessage.includes('age') || lowerMessage.includes('old')) {
            return 'I\'m an AI, so I don\'t have an age in the traditional sense. I\'m here to help you!';
        }
        
        if (lowerMessage.includes('love') || lowerMessage.includes('like')) {
            return 'That\'s very kind of you! I enjoy helping people and having conversations.';
        }
        
        if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
            return 'I don\'t eat food since I\'m an AI, but I can help you find recipes or restaurant recommendations!';
        }
        
        if (lowerMessage.includes('music') || lowerMessage.includes('song')) {
            return 'I can\'t play music, but I can help you discover new artists or discuss different genres!';
        }
        
        if (lowerMessage.includes('movie') || lowerMessage.includes('film')) {
            return 'I can help you find movie recommendations or discuss your favorite films!';
        }
        
        if (lowerMessage.includes('book') || lowerMessage.includes('read')) {
            return 'I can help you find book recommendations or discuss literature!';
        }
        
        if (lowerMessage.includes('sport') || lowerMessage.includes('game')) {
            return 'I can help you with sports information or discuss your favorite games!';
        }
        
        // Default response
        return this.fallbackResponses.default;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-message';
        typingDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            content.appendChild(dot);
        }
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
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
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    showErrorNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
