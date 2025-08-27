# Setup Guide for AI Chatbot

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- OpenAI API key

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your API keys:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   PORT=3000
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

#### Supabase Credentials
1. Go to [Supabase](https://supabase.com/)
2. Sign up or log in to your account
3. Create a new project or select an existing one
4. Go to Settings > API
5. Copy the "Project URL" and "anon public" key
6. Paste them in your `.env` file as `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### 4. Start the Server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

### 5. Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

## Verification

To verify everything is working:

1. Check server status: `http://localhost:3000/api/health`
   - Should show `openaiConfigured: true` and `supabaseConfigured: true`
   - `supabaseStatus` should be `connected`
2. Try sending a message in the chatbot
3. Check the console for any error messages
4. Verify conversations are being saved in your Supabase dashboard

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY not found"**
   - Make sure you've created a `.env` file
   - Verify the API key is correctly copied

2. **"SUPABASE_URL or SUPABASE_ANON_KEY not found"**
   - Make sure you've added both Supabase credentials to your `.env` file
   - Verify the credentials are correctly copied from your Supabase dashboard

3. **"Cannot connect to server"**
   - Check if the server is running on port 3000
   - Verify no other application is using the port

4. **"API connection failed"**
   - Check your internet connection
   - Verify your OpenAI API key is valid
   - Check your OpenAI account has sufficient credits

5. **"Database error"**
   - Verify your Supabase table structure is correct
   - Check that your Supabase project is active
   - Ensure your API key has the correct permissions

6. **Port already in use**
   - Change the PORT in `.env` file
   - Or kill the process using the port

### Getting Help

- Check the browser console for error messages
- Check the server console for backend errors
- Verify all dependencies are installed correctly

## Security Notes

- Never commit your `.env` file to version control
- Keep your OpenAI API key secure
- The `.env` file is already in `.gitignore` for safety
