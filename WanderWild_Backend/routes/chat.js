const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI (optional - will use fallback if not configured)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI initialized successfully');
  } catch (error) {
    console.warn('⚠️ OpenAI initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ OPENAI_API_KEY not set. Chatbot will use fallback responses.');
}

// @route   POST /api/chat/message
// @desc    Send a message to AI chatbot (public)
// @access  Public
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('Public chat message received:', message);

    // Generate AI response using OpenAI
    const aiResponse = await generateAIResponse(message, null);

    res.json({
      success: true,
      data: {
        content: aiResponse.content,
        message: aiResponse.content,
        metadata: aiResponse.metadata,
        sessionId: sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// @route   GET /api/chat/sessions
// @desc    Get user's chat sessions
// @access  Private
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: sessions, error, count } = await supabaseAdmin
      .from('chat_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch chat sessions'
      });
    }

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions'
    });
  }
});

// @route   POST /api/chat/sessions
// @desc    Create new chat session
// @access  Private
router.post('/sessions', authenticateToken, validate(schemas.createChatSession), async (req, res) => {
  try {
    const { session_name } = req.body;

    const sessionData = {
      user_id: req.user.id,
      session_name: session_name || `Chat Session ${new Date().toLocaleDateString()}`
    };

    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create chat session'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Chat session created successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session'
    });
  }
});

// @route   GET /api/chat/sessions/:id
// @desc    Get chat session by ID
// @access  Private
router.get('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat session'
    });
  }
});

// @route   PUT /api/chat/sessions/:id
// @desc    Update chat session
// @access  Private
router.put('/sessions/:id', authenticateToken, validate(schemas.createChatSession), async (req, res) => {
  try {
    const { id } = req.params;
    const { session_name } = req.body;

    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .update({
        session_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update chat session'
      });
    }

    res.json({
      success: true,
      message: 'Chat session updated successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Update chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat session'
    });
  }
});

// @route   DELETE /api/chat/sessions/:id
// @desc    Delete chat session
// @access  Private
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete chat session'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
});

// @route   GET /api/chat/sessions/:id/messages
// @desc    Get messages for a chat session
// @access  Private
router.get('/sessions/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user owns the session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const { data: messages, error, count } = await supabaseAdmin
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages'
    });
  }
});

// @route   POST /api/chat/sessions/:id/messages
// @desc    Send message in chat session
// @access  Private
router.post('/sessions/:id/messages', authenticateToken, validate(schemas.createChatMessage), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, metadata } = req.body;

    // Check if user owns the session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Create user message
    const userMessageData = {
      session_id: id,
      role: 'user',
      content,
      metadata: metadata || {}
    };

    const { data: userMessage, error: userMessageError } = await supabaseAdmin
      .from('chat_messages')
      .insert(userMessageData)
      .select()
      .single();

    if (userMessageError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send message'
      });
    }

    // Generate AI response (simplified - in real app, integrate with OpenAI/Claude)
    const aiResponse = await generateAIResponse(content, req.user);

    // Create AI message
    const aiMessageData = {
      session_id: id,
      role: 'ai',
      content: aiResponse.content,
      metadata: aiResponse.metadata || {}
    };

    const { data: aiMessage, error: aiMessageError } = await supabaseAdmin
      .from('chat_messages')
      .insert(aiMessageData)
      .select()
      .single();

    if (aiMessageError) {
      console.error('Failed to create AI message:', aiMessageError);
    }

    // Update session timestamp
    await supabaseAdmin
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage,
        aiMessage: aiMessage || null
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   DELETE /api/chat/messages/:id
// @desc    Delete chat message
// @access  Private
router.delete('/messages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the message through session
    const { data: message, error: messageError } = await supabaseAdmin
      .from('chat_messages')
      .select(`
        id,
        chat_sessions!inner (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (messageError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.chat_sessions.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { error } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete message'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Helper function to generate AI response using OpenAI
async function generateAIResponse(userMessage, user) {
  try {
    const message = userMessage.toLowerCase();
    let metadata = {};
    let contextData = '';

    // Fetch comprehensive data from database
    // 1. Fetch all active packages with full details
    const { data: packages } = await supabaseAdmin
      .from('packages')
      .select(`
        id, 
        name, 
        location, 
        price, 
        description, 
        main_image, 
        duration_days, 
        category,
        max_people,
        min_people,
        difficulty_level,
        status,
        agencies!inner(
          id,
          agency_name,
          description
        )
      `)
      .eq('status', 'active')
      .limit(15);

    // 2. Fetch categories
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, description')
      .limit(10);

    // 3. Fetch agencies
    const { data: agencies } = await supabaseAdmin
      .from('agencies')
      .select('id, agency_name, description, country, city')
      .eq('verification_status', 'verified')
      .limit(10);

    // Build comprehensive context for AI
    contextData = '\n\n=== AVAILABLE DATA FROM DATABASE ===\n\n';

    // Add packages information
    if (packages && packages.length > 0) {
      contextData += '📦 PACKAGES:\n';
      packages.forEach((pkg, index) => {
        contextData += `\n${index + 1}. "${pkg.name}"\n`;
        contextData += `   📍 Location: ${pkg.location}\n`;
        contextData += `   💰 Price: $${pkg.price}\n`;
        contextData += `   ⏱️ Duration: ${pkg.duration_days} days\n`;
        contextData += `   👥 Group Size: ${pkg.min_people}-${pkg.max_people} people\n`;
        contextData += `   📊 Difficulty: ${pkg.difficulty_level || 'N/A'}\n`;
        contextData += `   🏢 Agency: ${pkg.agencies?.agency_name || 'N/A'}\n`;
        contextData += `   📝 Description: ${pkg.description?.substring(0, 200) || 'N/A'}\n`;
      });
      metadata.suggested_packages = packages.slice(0, 3);
    }

    // Add categories information
    if (categories && categories.length > 0) {
      contextData += '\n\n🏷️ AVAILABLE CATEGORIES:\n';
      categories.forEach((cat, index) => {
        contextData += `${index + 1}. ${cat.name}`;
        if (cat.description) {
          contextData += ` - ${cat.description.substring(0, 100)}`;
        }
        contextData += '\n';
      });
    }

    // Add agencies information
    if (agencies && agencies.length > 0) {
      contextData += '\n\n🏢 VERIFIED AGENCIES:\n';
      agencies.forEach((agency, index) => {
        contextData += `${index + 1}. ${agency.agency_name}`;
        if (agency.city && agency.country) {
          contextData += ` (${agency.city}, ${agency.country})`;
        }
        if (agency.description) {
          contextData += ` - ${agency.description.substring(0, 100)}`;
        }
        contextData += '\n';
      });
    }

    contextData += '\n=== END OF DATABASE DATA ===\n';

    // Use OpenAI if available, otherwise use fallback
    if (openai) {
      try {
        // Create OpenAI chat completion
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are WanderWild's AI travel assistant. Your responses MUST be based ONLY on the actual data provided from our database below.

CRITICAL RULES:
1. ONLY recommend packages, agencies, and destinations that are listed in the database data below
2. Use EXACT names, prices, locations, and details from the database
3. DO NOT make up or suggest packages that are not in the database
4. If asked about something not in the database, say "We don't currently have packages for that, but let me show you what we do have"
5. Always reference specific package names, prices, and agencies from the data
6. Be accurate with numbers - use exact prices and durations from the database

${contextData}

YOUR SPECIALTIES (based on available data):
- Rural destinations and countryside experiences
- Adventure packages and outdoor activities  
- Budget-friendly travel options
- Cultural and traditional experiences
- Homestay accommodations
- Local food tours
- Nature and wildlife experiences
- Traditional crafts workshops

RESPONSE GUIDELINES:
- Be friendly and conversational
- Reference specific packages by their exact names
- Include actual prices and durations
- Mention the agency name for each package
- If multiple packages match, list them with their details
- Format responses with clear line breaks
- Use emojis to make responses engaging
- Stay factual - only use the database information provided above

Remember: Your credibility depends on accuracy. Only suggest what actually exists in our database!`
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const response = completion.choices[0].message.content;

        return {
          content: response,
          metadata
        };
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError.message);
        // Fall through to rule-based fallback
      }
    }

    // Rule-based fallback response when OpenAI is not available
    let response = generateFallbackResponse(message, packages);
    
    return {
      content: response,
      metadata
    };
  } catch (error) {
    console.error('AI response generation error:', error);
    
    // Ultimate fallback response
    return {
      content: "I'm your WanderWild travel assistant! I can help you discover amazing rural destinations, adventure packages, cultural experiences, homestays, food tours, and nature experiences. What would you like to explore today?",
      metadata: {}
    };
  }
}

// Fallback response generator for when OpenAI is not available
function generateFallbackResponse(message, packages) {
  if (!packages || packages.length === 0) {
    return `👋 **Welcome to WanderWild!**\n\nI'm your travel assistant, but it seems we don't have any packages loaded right now. Please check back soon or contact our support team.`;
  }

  const packagesList = packages.slice(0, 3).map((pkg, idx) => 
    `\n${idx + 1}. **${pkg.name}** (by ${pkg.agencies?.agency_name || 'N/A'})\n   📍 ${pkg.location}\n   💰 $${pkg.price} | ⏱️ ${pkg.duration_days} days\n   ${pkg.description ? pkg.description.substring(0, 100) + '...' : ''}`
  ).join('\n');

  // Check for specific queries
  if (message.includes('rural') || message.includes('countryside') || message.includes('destination')) {
    const ruralPackages = packages.filter(p => 
      p.name?.toLowerCase().includes('rural') || 
      p.description?.toLowerCase().includes('rural') ||
      p.category?.toLowerCase().includes('rural')
    );
    const displayPackages = ruralPackages.length > 0 ? ruralPackages.slice(0, 3) : packages.slice(0, 3);
    const list = displayPackages.map((pkg, idx) => 
      `\n${idx + 1}. **${pkg.name}** (by ${pkg.agencies?.agency_name || 'N/A'})\n   📍 ${pkg.location}\n   💰 $${pkg.price} | ⏱️ ${pkg.duration_days} days`
    ).join('\n');
    return `🏞️ **Rural Destinations**\n\nBased on our database, here are authentic rural experiences we offer:${list}\n\nWould you like more details about any of these?`;
  }
  
  if (message.includes('adventure') || message.includes('outdoor') || message.includes('hiking')) {
    return `🎿 **Adventure Packages from Our Database**\n\nHere are the adventure packages we currently offer:${packagesList}\n\nThese are real packages from our verified agencies. Would you like more details about any of them?`;
  }
  
  if (message.includes('budget') || message.includes('cheap') || message.includes('affordable')) {
    const budgetPackages = packages.filter(p => p.price < 1000).slice(0, 3);
    if (budgetPackages.length > 0) {
      const budgetList = budgetPackages.map((pkg, idx) => 
        `\n${idx + 1}. **${pkg.name}** (by ${pkg.agencies?.agency_name || 'N/A'})\n   📍 ${pkg.location}\n   💰 $${pkg.price} | ⏱️ ${pkg.duration_days} days`
      ).join('\n');
      return `💰 **Budget-Friendly Options (Under $1000)**\n\nFrom our database, here are affordable packages:${budgetList}\n\nAll prices are accurate as per our current listings!`;
    }
    return `💰 **Budget Options**\n\nHere are our available packages:${packagesList}\n\nWhat's your budget range? I can help you find the best option!`;
  }
  
  if (message.includes('cultural') || message.includes('traditional') || message.includes('heritage')) {
    return `🎭 **Cultural Experiences**\n\nFrom our database, here are packages with cultural elements:${packagesList}\n\nEach package is offered by verified agencies. Want to know more about any specific one?`;
  }
  
  if (message.includes('homestay') || message.includes('local famil')) {
    return `🏠 **Available Packages**\n\nHere are our current offerings:${packagesList}\n\nFor homestay availability, I recommend contacting the agency directly after selecting a package.`;
  }
  
  if (message.includes('food') || message.includes('culinary') || message.includes('cooking')) {
    return `🍜 **Travel Packages**\n\nHere are our available packages:${packagesList}\n\nMany of our rural experiences include authentic local cuisine. Check the package details for more info!`;
  }
  
  if (message.includes('nature') || message.includes('wildlife') || message.includes('eco')) {
    return `🌿 **Nature & Eco Packages**\n\nFrom our database:${packagesList}\n\nThese packages offer opportunities to connect with nature. Would you like details about any of them?`;
  }
  
  if (message.includes('craft') || message.includes('artisan') || message.includes('handicraft')) {
    return `🎨 **Our Available Packages**\n\nHere's what we currently have:${packagesList}\n\nSome packages may include traditional craft experiences. Check with the agency for specific activities!`;
  }
  
  // Default welcome response with actual data
  return `👋 **Welcome to WanderWild!**\n\nI can help you explore our ${packages.length} available packages! Here are some options:${packagesList}\n\nI specialize in:\n🏞️ Rural destinations | 🎿 Adventure packages | 💰 Budget options\n🎭 Cultural experiences | 🏠 Homestays | 🍜 Food tours\n\nWhat interests you?`;
}

module.exports = router;
