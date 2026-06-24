# 🔑 OpenAI API Key Setup

## ⚠️ IMPORTANT: Variable Name Must Be Exact!

The OpenAI API key environment variable **MUST** be named exactly:
```
OPENAI_API_KEY
```

**NOT:**
- ~~OPEN_AI_API_KEY~~ ❌
- ~~OPENAI_KEY~~ ❌
- ~~OPEN_AI_KEY~~ ❌
- ~~OpenAI_API_Key~~ ❌

## Quick Setup (3 Steps)

### 1. Get Your API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

### 2. Add to .env File
```bash
# Navigate to backend directory
cd WanderWild_Backend

# Edit .env file
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

Add this line with YOUR actual key:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Restart Server
```bash
npm run dev
```

## ✅ Verify It's Working

When the server starts, you should see:
```
🚀 WanderWild Backend Server running on port 5000
📊 Environment: development
```

**You should NOT see:**
```
⚠️ OPENAI_API_KEY not set. Chatbot will use fallback responses.
⚠️ OPENAI_API_KEY not set. AI itinerary generation will use fallback responses.
```

## 🧪 Test the Integration

### Test AI Itinerary Generator:
1. Go to: http://localhost:3000/ai-itinerary
2. Fill in the form:
   - **From Location**: "New York" (optional but recommended)
   - **Destination**: "Tokyo, Japan"
   - **Duration**: "1 week"
   - **Interests**: Select "Culture & History", "Food & Cuisine"
   - **Budget**: "Mid-range ($500-$1000)"
3. Click "Generate Itinerary"
4. Wait 5-10 seconds for AI to generate

### Expected Result:
You should see a detailed itinerary with:
- Flight/transportation recommendations from New York to Tokyo
- Day-by-day activities with specific times
- Restaurant and meal suggestions
- Accommodation recommendations
- Budget breakdowns
- Travel tips specific to Tokyo
- Local transportation info

## 🐛 Troubleshooting

### Issue: Still seeing "OPENAI_API_KEY not set"
**Solution:**
1. Check `.env` file exists in `WanderWild_Backend/` folder
2. Verify variable name is **exactly** `OPENAI_API_KEY` (no typos!)
3. Make sure there's no space around the `=` sign
4. Restart the server (`Ctrl+C` then `npm run dev`)

### Issue: "401 Unauthorized" error in frontend
**Solution:**
This is fixed! We now use the public endpoint `/api/ai-itinerary/generate` which doesn't require authentication.

### Issue: API returns "Invalid API Key"
**Solution:**
1. Double-check your API key is correct
2. Make sure you copied the entire key
3. Verify your OpenAI account has credits
4. Check usage limits at https://platform.openai.com/usage

### Issue: Response is slow
**Solution:**
- OpenAI API typically takes 5-15 seconds to generate detailed itineraries
- This is normal for AI text generation
- The frontend shows a loading spinner during this time

## 💰 Cost Information

- Model: GPT-3.5-turbo
- Cost: ~$0.001 per 1K tokens
- Average itinerary: 800-1500 tokens
- **Cost per generation: $0.0008 - $0.0015**
- Very affordable! (~$1 for 1000 itineraries)

## 🔒 Security Best Practices

1. ✅ Never commit `.env` file to git (already in `.gitignore`)
2. ✅ Keep your API key private
3. ✅ Rotate keys if accidentally exposed
4. ✅ Set spending limits in OpenAI dashboard
5. ✅ Monitor usage regularly

## 📝 Example .env File

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# OpenAI Configuration (CRITICAL - MUST BE EXACT!)
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## ✨ Features Enabled by OpenAI

### 1. AI Chatbot (`/chatbot`)
- Answers travel questions
- Recommends destinations
- Suggests packages
- Provides travel advice

### 2. AI Itinerary Generator (`/ai-itinerary`)
- Creates personalized day-by-day plans
- Includes transportation recommendations
- Suggests activities based on interests
- Provides budget breakdowns
- Offers practical travel tips

## 🎉 Success Indicators

When everything is working correctly:
1. ✅ No warning messages about missing API key
2. ✅ Itinerary generates in 5-15 seconds
3. ✅ Detailed, location-specific content
4. ✅ Realistic recommendations and timings
5. ✅ Transportation details included

## 📞 Need Help?

If you're still having issues:
1. Check the server console for error messages
2. Look at browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Make sure your OpenAI account is active
5. Check that you have available credits

---

**Remember: The variable name is `OPENAI_API_KEY` - exactly like that!** 🔑

