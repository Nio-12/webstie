# AI Chatbot

A modern, responsive web chatbot built with HTML, CSS, and JavaScript. This chatbot uses fixed responses to simulate an AI conversation experience.

## Features

- 🎨 **Modern UI Design**: Clean, responsive interface with smooth animations
- 💬 **Real-time Chat**: Instant message display with typing indicators
- 🤖 **AI-Powered Responses**: OpenAI GPT-3.5-turbo integration for intelligent conversations
- 🗄️ **Persistent Storage**: Supabase database integration for conversation history
- 📱 **Mobile Responsive**: Works perfectly on desktop and mobile devices
- ⚡ **Quick Replies**: Pre-defined buttons for common questions
- 🎯 **Smart Response Matching**: Keyword-based fallback system
- 🕒 **Time Stamps**: Messages include current time
- 🎭 **Typing Animation**: Visual feedback when the bot is "thinking"
- 🔄 **Session Management**: Unique conversation sessions with persistent history

## How to Use

### Backend Setup (Required for Full Functionality)

1. **Install Dependencies**: Run `npm install` to install required packages
2. **Configure Environment**: 
   - Copy `env.example` to `.env`
   - Add your API keys to the `.env` file:
     ```
     OPENAI_API_KEY=your_actual_openai_api_key_here
     PORT=3000
     SUPABASE_URL=your_supabase_project_url_here
     SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```
3. **Set Up Supabase Database**: Create a table named `conversations` with columns:
   - `id` (uuid, primary key)
   - `created_at` (timestamp with time zone)
   - `conversation_id` (text)
   - `messages` (jsonb)
4. **Start the Server**: Run `npm start` or `npm run dev` for development mode
5. **Verify Setup**: Visit `http://localhost:3000/api/health` to check if the server is running

### Frontend Usage

1. **Open the Application**: Visit `http://localhost:3000` in your web browser
2. **Start Chatting**: Type your message in the input field and press Enter or click the send button
3. **Use Quick Replies**: Click on the pre-defined buttons below the input field for instant responses
4. **Explore Features**: Try asking about jokes, weather, time, or general questions

### Fallback Mode

If the backend server is not running, the API keys are not configured, or there are connection issues, the chatbot will automatically fall back to local responses.

## Supported Commands

The chatbot can respond to various types of messages:

### Basic Greetings
- "Hello", "Hi"
- "How are you?"
- "What's your name?"
- "Who are you?"

### Information Requests
- "What can you help me with?"
- "Help"
- "What time is it?"
- "What's the date today?"

### Entertainment
- "Tell me a joke"
- "Say something funny"

### Weather
- "What's the weather like?"
- "Weather"

### General Topics
- Movies, books, music, sports, food
- Age, love, likes/dislikes

### Farewell
- "Goodbye", "Bye"
- "Thanks", "Thank you"

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript functionality
├── server.js           # Node.js backend server
├── package.json        # Node.js dependencies
├── env.example         # Environment variables template
└── README.md           # This file
```

## Customization

### Adding New Responses

To add new bot responses, edit the `responses` object in `script.js`:

```javascript
this.responses = {
    'your keyword': 'Your response here',
    // ... existing responses
};
```

### Styling Changes

Modify `styles.css` to change colors, fonts, or layout:

- Main gradient: Lines 8-9
- Chat container: Lines 18-25
- Message bubbles: Lines 75-85
- Buttons: Lines 130-150

### Quick Reply Buttons

Add or modify quick reply buttons in `index.html`:

```html
<button class="quick-reply" data-message="Your message">Button Text</button>
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Technologies Used

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with Flexbox and animations
- **JavaScript (ES6+)**: Class-based architecture with async/await
- **Font Awesome**: Icons for UI elements

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **OpenAI API**: AI language model integration
- **Supabase**: Database and backend-as-a-service
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:sessionId` - Get conversation history
- `DELETE /api/conversation/:sessionId` - Clear conversation history
- `GET /api/health` - Health check endpoint

## Future Enhancements

- Voice input/output
- File sharing capabilities
- User authentication
- Multi-language support
- Real-time typing indicators
- Message reactions and emojis
- Conversation analytics
- Export conversation history

## License

This project is open source and available under the MIT License.

---

**Enjoy chatting with your AI Assistant! 🤖✨**
