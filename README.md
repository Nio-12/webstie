# AI Chatbot with OpenAI Integration

A modern AI chatbot with a beautiful UI that connects to OpenAI's GPT-3.5-turbo API for intelligent responses. The application features a Node.js backend with conversation storage and a responsive frontend.

## Features

- 🤖 **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses
- 💬 **Conversation Memory**: Maintains conversation history during the session
- 🎨 **Modern UI**: Beautiful, responsive chat interface
- 🔄 **Real-time Communication**: Instant message processing
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🛡️ **Secure**: API key stored in environment variables

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   PORT=3000
   ```

   **Important**: Replace `your_actual_openai_api_key_here` with your real OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### 3. Start the Server

```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

The server will start on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:sessionId` - Get conversation history
- `DELETE /api/conversation/:sessionId` - Clear conversation
- `GET /api/health` - Health check

## Project Structure

```
webstie/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Node.js backend server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
├── env.example        # Example environment file
└── README.md          # This file
```

## How It Works

1. **Frontend**: The chat interface sends messages to the backend API
2. **Backend**: Processes messages through OpenAI API and stores conversations
3. **Storage**: Conversations are stored in memory (can be extended to use a database)
4. **Response**: AI responses are sent back to the frontend and displayed

## Customization

### Changing the AI Model

In `server.js`, you can modify the OpenAI model:

```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4', // Change to gpt-4 for better responses
  messages: messages,
  max_tokens: 500,
  temperature: 0.7,
});
```

### Modifying the System Prompt

Change the system message in `server.js`:

```javascript
{
  role: 'system',
  content: 'You are a helpful AI assistant. Be concise, friendly, and helpful in your responses.'
}
```

### Styling

Modify `styles.css` to customize the appearance of the chatbot.

## Troubleshooting

### Common Issues

1. **"Failed to process message" error**
   - Check if your OpenAI API key is correct
   - Ensure you have sufficient API credits
   - Verify the API key is properly set in the `.env` file

2. **CORS errors**
   - The backend is configured to allow CORS from the frontend
   - If you're running on a different port, update the CORS configuration

3. **Port already in use**
   - Change the PORT in your `.env` file
   - Or kill the process using the current port

### Getting Help

- Check the browser console for frontend errors
- Check the server console for backend errors
- Verify your OpenAI API key is valid and has credits

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys should be kept secure and not shared

## Future Enhancements

- Database integration for persistent conversation storage
- User authentication
- Multiple conversation threads
- File upload support
- Voice input/output
- Custom AI personalities

## License

MIT License - feel free to use this project for your own applications!
