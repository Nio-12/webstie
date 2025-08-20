const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// In-memory storage for conversations (in production, use a database)
const conversations = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// API endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ 
        error: 'Message and sessionId are required' 
      });
    }

    // Get or create conversation for this session
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    
    const conversation = conversations.get(sessionId);
    
    // Add user message to conversation
    conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Prepare messages for OpenAI (include conversation history)
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Be concise, friendly, and helpful in your responses.'
      },
      ...conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to conversation
    conversation.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });

    // Keep only last 20 messages to prevent context from getting too long
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }

    res.json({
      response: aiResponse,
      conversation: conversation
    });

  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

// API endpoint to get conversation history
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!conversations.has(sessionId)) {
    return res.json({ conversation: [] });
  }
  
  res.json({ 
    conversation: conversations.get(sessionId) 
  });
});

// API endpoint to clear conversation
app.delete('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (conversations.has(sessionId)) {
    conversations.delete(sessionId);
  }
  
  res.json({ message: 'Conversation cleared' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeConversations: conversations.size
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/chat - Send a message`);
  console.log(`  GET /api/conversation/:sessionId - Get conversation history`);
  console.log(`  DELETE /api/conversation/:sessionId - Clear conversation`);
  console.log(`  GET /api/health - Health check`);
});
