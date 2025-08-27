const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
let openai;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('⚠️  OpenAI API key not configured properly');
}

// Initialize Supabase
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
    process.env.SUPABASE_URL !== 'your_supabase_project_url_here' && 
    process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here') {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
} else {
  console.warn('⚠️  Supabase credentials not configured properly');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ 
        error: 'Message and sessionId are required' 
      });
    }

    // Check if OpenAI is configured
    if (!openai) {
      return res.status(500).json({
        error: 'OpenAI not configured',
        message: 'Please configure your OpenAI API key in the .env file'
      });
    }

    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        message: 'Please configure your Supabase credentials in the .env file'
      });
    }

    // Get or create conversation from Supabase
    let { data: conversationData, error: fetchError } = await supabase
      .from('conversations')
      .select('messages')
      .eq('conversation_id', sessionId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching conversation:', fetchError);
      return res.status(500).json({
        error: 'Database error',
        message: fetchError.message
      });
    }

    let conversation = conversationData?.messages || [];
    
    // Add user message to conversation history
    conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Prepare messages for OpenAI (include conversation history)
    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant. Be friendly, concise, and engaging. 
        Keep responses under 200 words unless the user asks for more detail. 
        Use emojis occasionally to make conversations more engaging.`
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

    const botResponse = completion.choices[0].message.content;

    // Add bot response to conversation history
    conversation.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date().toISOString()
    });

    // Keep only last 20 messages to prevent context from getting too long
    if (conversation.length > 20) {
      conversation = conversation.slice(-20);
    }

    // Save or update conversation in Supabase
    if (conversationData) {
      // Update existing conversation
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          messages: conversation
        })
        .eq('conversation_id', sessionId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
        return res.status(500).json({
          error: 'Database error',
          message: updateError.message
        });
      }
    } else {
      // Create new conversation
      const { error: insertError } = await supabase
        .from('conversations')
        .insert({
          conversation_id: sessionId,
          messages: conversation
        });

      if (insertError) {
        console.error('Error creating conversation:', insertError);
        return res.status(500).json({
          error: 'Database error',
          message: insertError.message
        });
      }
    }

    res.json({
      response: botResponse,
      conversation: conversation
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Handle OpenAI API errors
    if (error.response) {
      return res.status(500).json({
        error: 'OpenAI API error',
        details: error.response.data
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get conversation history
app.get('/api/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        message: 'Please configure your Supabase credentials in the .env file'
      });
    }
    
    const { data, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('conversation_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return res.json({ conversation: [] });
      }
      console.error('Error fetching conversation:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }
    
    res.json({ conversation: data.messages || [] });
  } catch (error) {
    console.error('Error in get conversation endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Clear conversation history
app.delete('/api/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        message: 'Please configure your Supabase credentials in the .env file'
      });
    }
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', sessionId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }
    
    res.json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    console.error('Error in delete conversation endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    let supabaseStatus = 'not_configured';
    let supabaseError = null;
    
    if (supabase) {
      // Test Supabase connection
      const { data, error } = await supabase
        .from('conversations')
        .select('count')
        .limit(1);

      supabaseStatus = !error ? 'connected' : 'error';
      supabaseError = error?.message || null;
    }
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      openaiConfigured: !!openai,
      supabaseConfigured: !!supabase,
      supabaseStatus: supabaseStatus,
      supabaseError: supabaseError,
      envCheck: {
        hasOpenAIKey: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'),
        hasSupabaseURL: !!(process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_project_url_here'),
        hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here')
      }
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      openaiConfigured: !!openai,
      supabaseConfigured: !!supabase,
      supabaseStatus: 'error',
      supabaseError: error.message,
      envCheck: {
        hasOpenAIKey: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'),
        hasSupabaseURL: !!(process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_project_url_here'),
        hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here')
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST /api/chat - Send a message`);
  console.log(`   GET /api/conversation/:sessionId - Get conversation history`);
  console.log(`   DELETE /api/conversation/:sessionId - Clear conversation`);
  console.log(`   GET /api/health - Health check`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Warning: OPENAI_API_KEY not found in environment variables');
  }
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  Warning: Supabase credentials not found in environment variables');
  } else {
    console.log('✅ Supabase credentials configured');
  }
});
