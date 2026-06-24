# OpenAI AI Setup

## Overview
The WanderWild platform uses OpenAI's GPT-3.5-turbo model to power two intelligent AI features:
1. **AI Travel Assistant Chatbot** - Helps users discover destinations and packages
2. **AI Itinerary Generator** - Creates personalized day-by-day travel itineraries

## Features

### AI Chatbot
The AI chatbot can assist with:
- 🏞️ Rural destinations and countryside experiences
- 🎿 Adventure packages and outdoor activities
- 💰 Budget-friendly travel options
- 🎭 Cultural and traditional experiences
- 🏠 Homestay accommodations with local families
- 🍜 Local food tours and culinary experiences
- 🌿 Nature and wildlife experiences
- 🎨 Traditional crafts and artisan workshops

### AI Itinerary Generator
The AI itinerary generator creates:
- 📅 Detailed day-by-day travel plans
- ⏰ Time-specific activity recommendations
- 🍽️ Meal and dining suggestions
- 💰 Budget-based cost breakdowns
- 🏨 Accommodation recommendations
- 🎯 Interest-based activity planning
- 💡 Practical travel tips
- 🚗 Transportation guidance

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the generated API key (you won't be able to see it again!)

### 2. Add API Key to Environment Variables

1. Navigate to the `WanderWild_Backend` directory
2. Create a `.env` file if it doesn't exist (copy from `env.example`)
3. Add the following line with your actual API key:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Verify Installation

The OpenAI package has been installed via:
```bash
npm install openai
```

### 4. Restart the Server

```bash
npm run dev
```

## How It Works

### Backend (`routes/chat.js`)
- The chatbot uses OpenAI's GPT-3.5-turbo model
- Fetches available packages from the database to provide context
- Sends user messages along with package data to OpenAI
- Returns intelligent, context-aware responses
- Falls back to a friendly message if OpenAI API fails

### Frontend (`app/chatbot/page.tsx`)
- Users can type messages or click Quick Action buttons
- Quick Actions auto-submit queries like:
  - "Show me rural destinations"
  - "Find adventure packages"
  - "Budget travel options"
  - etc.
- Displays real-time AI responses with loading indicators

## API Endpoints

### 1. POST `/api/chat/message` (Public)
Send a message to the AI chatbot

**Request:**
```json
{
  "message": "Show me rural destinations"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "I'd love to help you discover some amazing rural destinations! Based on our available packages...",
    "metadata": {
      "suggested_packages": [...]
    },
    "sessionId": "session_1234567890",
    "timestamp": "2026-01-01T12:00:00.000Z"
  }
}
```

### 2. POST `/api/ai-itinerary` (Private - Requires Auth)
Generate a personalized AI itinerary

**Request:**
```json
{
  "destination": "Bali, Indonesia",
  "duration_days": 7,
  "budget_range": "Mid-range ($500-$1000)",
  "interests": ["Culture & History", "Food & Cuisine", "Nature & Wildlife"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Itinerary generated successfully",
  "itinerary": "Bali Adventure - 7 Day Itinerary\n\nDay 1: Arrival in Bali\n...",
  "data": {
    "itinerary": {
      "id": "uuid",
      "destination": "Bali, Indonesia",
      "duration_days": 7,
      "generated_itinerary": {...},
      "status": "draft"
    }
  }
}
```

### 3. POST `/api/ai-itinerary/generate` (Public)
Generate an AI itinerary without authentication (not saved to database)

**Request:**
```json
{
  "destination": "Thailand",
  "duration": "1 week",
  "budget": "Budget ($150-$500)",
  "interests": ["Adventure & Outdoors", "Food & Cuisine"],
  "travelers": 2
}
```

**Response:**
```json
{
  "success": true,
  "itinerary": "Thailand Adventure - 7 Day Itinerary\n\nDay 1: ...",
  "data": {
    "title": "Thailand Adventure - 7 Day Itinerary",
    "summary": "A carefully crafted 7-day itinerary...",
    "full_itinerary": "...",
    "total_estimated_cost": 2100
  }
}
```

## Cost Considerations

- GPT-3.5-turbo is cost-effective (~$0.001 per 1K tokens)
- Average chat interaction: 200-500 tokens
- Estimated cost: ~$0.0002 - $0.0005 per message
- Set usage limits in your OpenAI dashboard

## Troubleshooting

### "API Key not found" Error
- Ensure `.env` file exists in `WanderWild_Backend` directory
- Check that `OPENAI_API_KEY` is properly set
- Restart the server after adding the key

### Rate Limiting
- OpenAI has rate limits based on your plan
- Free tier: 3 requests/minute
- Paid tier: Higher limits
- The chatbot has a fallback response if API fails

### Response Quality
- The system prompt is optimized for rural tourism
- Context includes available packages from database
- Temperature is set to 0.7 for balanced creativity
- Max tokens is 500 to keep responses concise

## Testing

### Test the AI Chatbot
Try these queries:
- "Show me rural destinations"
- "Find adventure packages under $1000"
- "What homestay options do you have?"
- "Tell me about local food tours"
- "I want cultural experiences in authentic villages"

### Test the AI Itinerary Generator
1. Go to `/ai-itinerary` page
2. Fill in the form:
   - **Destination**: "Bali, Indonesia" or "Thailand" or "Japan"
   - **Duration**: "1 week" or "2 weeks"
   - **Interests**: Select multiple (Culture, Food, Adventure, etc.)
   - **Budget**: Choose your budget range
3. Click "Generate Itinerary"
4. Wait for AI to generate a detailed day-by-day plan

Expected output includes:
- Day-by-day breakdown with specific activities
- Time-based scheduling (morning, afternoon, evening)
- Meal recommendations with location suggestions
- Accommodation advice
- Budget estimates per day
- Travel tips specific to the destination
- Transportation recommendations
- Best time to visit information

## Security Notes

- ⚠️ Never commit your `.env` file to version control
- Keep your OpenAI API key private
- Rotate keys if accidentally exposed
- Monitor usage in OpenAI dashboard
- Set spending limits to avoid unexpected charges

