const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Generate a unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Generate session ID if not provided
        const currentSessionId = sessionId || generateSessionId();
        
        // Get existing conversation from Supabase
        let { data: existingConversation, error: fetchError } = await supabase
            .from('conversations')
            .select('messages')
            .eq('conversation_id', currentSessionId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching conversation:', fetchError);
            return res.status(500).json({ 
                error: 'Failed to fetch conversation',
                details: fetchError.message 
            });
        }

        // Initialize or get conversation messages
        let conversation = existingConversation?.messages || [];
        
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
                content: `You are a helpful AI assistant for a fashion store called "Fashion Store". 
                You help customers with:
                - Product information and recommendations
                - Pricing and availability
                - Size guidance
                - Shipping and return policies
                - General fashion advice
                
                Always respond in Vietnamese and be friendly, helpful, and professional.
                Keep responses concise but informative.`
            },
            ...conversation.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        // Get AI response from OpenAI
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
            conversation = conversation.slice(-20);
        }

        // Save conversation to Supabase
        if (existingConversation) {
            // Update existing conversation
            const { error: updateError } = await supabase
                .from('conversations')
                .update({ messages: conversation })
                .eq('conversation_id', currentSessionId);

            if (updateError) {
                console.error('Error updating conversation:', updateError);
                return res.status(500).json({ 
                    error: 'Failed to save conversation',
                    details: updateError.message 
                });
            }
        } else {
            // Create new conversation
            const { error: insertError } = await supabase
                .from('conversations')
                .insert({
                    conversation_id: currentSessionId,
                    messages: conversation
                });

            if (insertError) {
                console.error('Error creating conversation:', insertError);
                return res.status(500).json({ 
                    error: 'Failed to create conversation',
                    details: insertError.message 
                });
            }
        }

        res.json({
            response: aiResponse,
            sessionId: currentSessionId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            details: error.message 
        });
    }
});

// Get conversation history
app.get('/api/conversation/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const { data: conversation, error } = await supabase
            .from('conversations')
            .select('messages')
            .eq('conversation_id', sessionId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching conversation:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch conversation',
                details: error.message 
            });
        }

        res.json({
            sessionId,
            messages: conversation?.messages || [],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({ error: 'Failed to get conversation' });
    }
});

// Clear conversation
app.delete('/api/conversation/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('conversation_id', sessionId);

        if (error) {
            console.error('Error deleting conversation:', error);
            return res.status(500).json({ 
                error: 'Failed to delete conversation',
                details: error.message 
            });
        }
        
        res.json({ message: 'Conversation cleared successfully' });

    } catch (error) {
        console.error('Error clearing conversation:', error);
        res.status(500).json({ error: 'Failed to clear conversation' });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test Supabase connection
        const { count, error } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase connection error:', error);
            return res.status(500).json({ 
                status: 'ERROR', 
                timestamp: new Date().toISOString(),
                error: 'Supabase connection failed',
                details: error.message
            });
        }

        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            database: 'Connected',
            totalConversations: count || 0
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ 
            status: 'ERROR', 
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
            details: error.message
        });
    }
});

// Get all active sessions (for debugging)
app.get('/api/sessions', async (req, res) => {
    try {
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select('conversation_id, messages, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sessions:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch sessions',
                details: error.message 
            });
        }

        const sessions = conversations.map(conv => ({
            sessionId: conv.conversation_id,
            messageCount: conv.messages ? conv.messages.length : 0,
            lastActivity: conv.created_at
        }));
        
        res.json({ sessions });
    } catch (error) {
        console.error('Error getting sessions:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   POST /api/chat - Send a message`);
    console.log(`   GET /api/conversation/:sessionId - Get conversation history`);
    console.log(`   DELETE /api/conversation/:sessionId - Clear conversation`);
    console.log(`   GET /api/health - Health check`);
    console.log(`   GET /api/sessions - Get all active sessions`);
    console.log(`🗄️  Database: Supabase connected`);
});
