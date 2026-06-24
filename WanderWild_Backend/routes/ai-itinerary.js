const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

if (!openai) {
  console.warn('⚠️  OPENAI_API_KEY not set. AI itinerary generation will use fallback responses.');
}

// @route   POST /api/ai-itinerary/generate
// @desc    Generate AI itinerary (public - no auth required)
// @access  Public
router.post('/generate', async (req, res) => {
  try {
    const { from_location, destination, duration, interests, budget, travelers } = req.body;

    // Basic validation
    if (!destination || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Destination and duration are required'
      });
    }

    // Parse duration to days
    const duration_days = duration === '1 week' ? 7 : 
                         duration === '2 weeks' ? 14 : 
                         duration === '1 month' ? 30 : 5;

    // Generate AI itinerary using OpenAI (without saving to database for public users)
    const generatedItinerary = await generateItinerary({
      from_location: from_location || 'Your Location',
      destination,
      duration_days,
      budget_range: budget || 'Mid-range ($500-$1000)',
      interests: interests || ['Culture & History'],
      user: null // No user for public generation
    });

    res.json({
      success: true,
      itinerary: generatedItinerary.full_itinerary || JSON.stringify(generatedItinerary, null, 2),
      data: {
        ...generatedItinerary,
        travelers: travelers || 2
      }
    });
  } catch (error) {
    console.error('AI itinerary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary'
    });
  }
});

// @route   GET /api/ai-itinerary
// @desc    Get user's AI itineraries
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('ai_itineraries')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: itineraries, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch itineraries'
      });
    }

    res.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itineraries'
    });
  }
});

// @route   GET /api/ai-itinerary/:id
// @desc    Get AI itinerary by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: itinerary, error } = await supabaseAdmin
      .from('ai_itineraries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    res.json({
      success: true,
      data: { itinerary }
    });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itinerary'
    });
  }
});

// @route   POST /api/ai-itinerary
// @desc    Generate AI itinerary
// @access  Private
router.post('/', authenticateToken, validate(schemas.createItinerary), async (req, res) => {
  try {
    const { destination, duration_days, budget_range, interests } = req.body;

    // Generate AI itinerary using OpenAI
    const generatedItinerary = await generateItinerary({
      destination,
      duration_days,
      budget_range,
      interests,
      user: req.user
    });

    // Save itinerary to database
    const itineraryData = {
      user_id: req.user.id,
      destination,
      duration_days,
      budget_range,
      interests: interests || [],
      generated_itinerary: generatedItinerary,
      status: 'draft'
    };

    const { data: itinerary, error } = await supabaseAdmin
      .from('ai_itineraries')
      .insert(itineraryData)
      .select()
      .single();

    if (error) {
      console.error('Database save error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to save itinerary'
      });
    }

    // Return the generated itinerary text for display
    res.status(201).json({
      success: true,
      message: 'Itinerary generated successfully',
      itinerary: generatedItinerary.full_itinerary || JSON.stringify(generatedItinerary, null, 2),
      data: { itinerary }
    });
  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary'
    });
  }
});

// @route   PUT /api/ai-itinerary/:id
// @desc    Update AI itinerary
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, generated_itinerary } = req.body;

    // Check if user owns the itinerary
    const { data: existingItinerary, error: existingError } = await supabaseAdmin
      .from('ai_itineraries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (existingError || !existingItinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (status !== undefined) {
      updateData.status = status;
    }
    if (generated_itinerary !== undefined) {
      updateData.generated_itinerary = generated_itinerary;
    }

    const { data: itinerary, error } = await supabaseAdmin
      .from('ai_itineraries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update itinerary'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      data: { itinerary }
    });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update itinerary'
    });
  }
});

// @route   DELETE /api/ai-itinerary/:id
// @desc    Delete AI itinerary
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('ai_itineraries')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete itinerary'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete itinerary'
    });
  }
});

// @route   POST /api/ai-itinerary/:id/regenerate
// @desc    Regenerate AI itinerary
// @access  Private
router.post('/:id/regenerate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing itinerary
    const { data: existingItinerary, error: existingError } = await supabaseAdmin
      .from('ai_itineraries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (existingError || !existingItinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Regenerate itinerary with same parameters
    const regeneratedItinerary = await generateItinerary({
      destination: existingItinerary.destination,
      duration_days: existingItinerary.duration_days,
      budget_range: existingItinerary.budget_range,
      interests: existingItinerary.interests,
      user: req.user
    });

    // Update itinerary
    const { data: itinerary, error } = await supabaseAdmin
      .from('ai_itineraries')
      .update({
        generated_itinerary: regeneratedItinerary,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to regenerate itinerary'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary regenerated successfully',
      data: { itinerary }
    });
  } catch (error) {
    console.error('Regenerate itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate itinerary'
    });
  }
});

// @route   POST /api/ai-itinerary/:id/share
// @desc    Share AI itinerary
// @access  Private
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Update itinerary status to shared
    const { data: itinerary, error } = await supabaseAdmin
      .from('ai_itineraries')
      .update({
        status: 'shared',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to share itinerary'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary shared successfully',
      data: { itinerary }
    });
  } catch (error) {
    console.error('Share itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share itinerary'
    });
  }
});

// Helper function to generate AI itinerary using OpenAI
async function generateItinerary({ from_location, destination, duration_days, budget_range, interests, user }) {
  try {
    const days = parseInt(duration_days);
    const budget = budget_range || 'Mid-range ($500-$1000)';
    const userInterests = interests || ['Culture & History'];
    const startingPoint = from_location || 'Your Location';

    // Get relevant packages for the destination
    const { data: packages } = await supabaseAdmin
      .from('packages')
      .select('id, name, location, price, description, highlights, itinerary')
      .eq('status', 'active')
      .ilike('location', `%${destination}%`)
      .limit(5);

    // If OpenAI is available, use it to generate itinerary
    if (openai) {
      try {
        const prompt = `Create a detailed ${days}-day travel itinerary for a trip from ${startingPoint} to ${destination}.

Trip Details:
- Starting Point: ${startingPoint}
- Destination: ${destination}
- Duration: ${days} days
- Budget Range: ${budget}
- Interests: ${userInterests.join(', ')}
${packages && packages.length > 0 ? `- Available tour packages: ${packages.map(p => p.name).join(', ')}` : ''}

Please provide:
1. A compelling title for the itinerary
2. A brief summary (2-3 sentences)
3. Flight/Transportation recommendations from ${startingPoint} to ${destination}:
   - Best airlines or transportation methods
   - Estimated travel time
   - Approximate cost
   - Tips for booking
4. Day-by-day breakdown with:
   - Morning activities (with specific times and duration)
   - Afternoon activities (with specific times and duration)
   - Evening activities (with specific times and duration)
   - Meal suggestions (breakfast, lunch, dinner with recommended locations)
   - Accommodation suggestions for each day
   - Estimated daily cost breakdown
5. Local transportation in ${destination}:
   - Best ways to get around (taxi, metro, rental car, etc.)
   - Transport passes or cards to consider
6. Total estimated cost for the entire trip (including flights)
7. 5-7 practical travel tips specific to ${destination}
8. Best time to visit
9. Important considerations for travelers from ${startingPoint}

Format the response as a detailed, engaging itinerary that a traveler would be excited to follow. Be specific with location names, activity descriptions, and practical details.`;

        console.log('Generating itinerary with OpenAI for:', destination);
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert travel planner with extensive knowledge of destinations worldwide. Create detailed, practical, and exciting travel itineraries that match the traveler's interests and budget. Be specific with recommendations and include practical tips."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        const generatedContent = completion.choices[0].message.content;
        
        // Parse the AI response into structured format
        const structuredItinerary = parseAIResponse(generatedContent, destination, days, budget, userInterests, packages);
        
        console.log('✅ Itinerary generated successfully with OpenAI');
        return structuredItinerary;
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        console.log('Falling back to template-based generation');
        // Fall back to template-based generation
        return generateFallbackItinerary(startingPoint, destination, days, budget, userInterests, packages);
      }
    } else {
      // Use fallback template if OpenAI is not available
      console.log('Using fallback itinerary generation');
      return generateFallbackItinerary(startingPoint, destination, days, budget, userInterests, packages);
    }
  } catch (error) {
    console.error('Itinerary generation error:', error);
    return {
      title: 'Itinerary Generation Failed',
      summary: 'Unable to generate itinerary at this time. Please try again.',
      days: [],
      error: 'Generation failed'
    };
  }
}

// Helper function to parse AI response into structured format
function parseAIResponse(aiContent, destination, days, budget, interests, packages) {
  // Extract structured data from AI response
  // For simplicity, we'll store the full text and create a basic structure
  return {
    title: `${destination} Adventure - ${days} Day Itinerary`,
    summary: aiContent.split('\n\n')[0] || `A carefully crafted ${days}-day itinerary for ${destination}`,
    full_itinerary: aiContent,
    destination: destination,
    duration_days: days,
    budget_range: budget,
    interests: interests,
    total_estimated_cost: calculateEstimatedCost(budget, days),
    recommended_packages: packages && packages.length > 0 ? packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      highlights: pkg.highlights,
      description: pkg.description
    })) : [],
    generated_by: 'openai',
    generated_at: new Date().toISOString()
  };
}

// Fallback itinerary generator when OpenAI is not available
function generateFallbackItinerary(fromLocation, destination, days, budget, interests, packages) {
  const itinerary = {
    title: `${destination} Adventure - ${days} Day Itinerary`,
    summary: `A carefully crafted ${days}-day itinerary from ${fromLocation} to ${destination} based on your interests in ${interests.join(', ')} and budget range of ${budget}.`,
    total_estimated_cost: calculateEstimatedCost(budget, days),
    from_location: fromLocation,
    destination: destination,
    duration_days: days,
    budget_range: budget,
    interests: interests,
    days: []
  };

  // Generate day-by-day itinerary
  for (let day = 1; day <= days; day++) {
    const dayPlan = {
      day: day,
      title: getDayTitle(day, destination),
      activities: [],
      meals: [],
      accommodation: day === 1 ? 'Check-in at recommended hotel' : 'Continue stay',
      estimated_cost: calculateDayCost(budget, day)
    };

    // Add activities based on interests
    if (interests.includes('Culture & History')) {
      dayPlan.activities.push({
        time: '09:00',
        activity: 'Visit historical landmarks and cultural sites',
        duration: '3 hours',
        description: 'Explore the rich cultural heritage of the destination'
      });
    }

    if (interests.includes('Food & Cuisine')) {
      dayPlan.activities.push({
        time: '12:00',
        activity: 'Local food tour',
        duration: '2 hours',
        description: 'Experience authentic local cuisine and cooking traditions'
      });
    }

    if (interests.includes('Adventure & Outdoors')) {
      dayPlan.activities.push({
        time: '15:00',
        activity: 'Outdoor adventure activity',
        duration: '3 hours',
        description: 'Engage in thrilling outdoor activities'
      });
    }

    if (interests.includes('Nature & Wildlife')) {
      dayPlan.activities.push({
        time: '08:00',
        activity: 'Nature exploration',
        duration: '4 hours',
        description: 'Discover natural beauty and wildlife'
      });
    }

    // Add meals
    dayPlan.meals = [
      { time: '08:00', meal: 'Breakfast', location: 'Hotel restaurant' },
      { time: '13:00', meal: 'Lunch', location: 'Local restaurant' },
      { time: '19:00', meal: 'Dinner', location: 'Traditional eatery' }
    ];

    itinerary.days.push(dayPlan);
  }

  // Add package recommendations if available
  if (packages && packages.length > 0) {
    itinerary.recommended_packages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      highlights: pkg.highlights,
      description: pkg.description
    }));
  }

  // Add travel tips
  itinerary.travel_tips = [
    'Book accommodations in advance during peak season',
    'Carry local currency for small purchases',
    'Download offline maps for navigation',
    'Check visa requirements before travel',
    'Purchase travel insurance for peace of mind'
  ];

  // Create full text version for display
  let fullText = `${itinerary.title}\n\n${itinerary.summary}\n\n`;
  
  // Add transportation section
  fullText += `Getting There:\n`;
  fullText += `Traveling from ${fromLocation} to ${destination}\n`;
  fullText += `• Consider booking flights 2-3 months in advance for best prices\n`;
  fullText += `• Check for connecting flights or direct routes\n`;
  fullText += `• Budget approximately $300-$800 for round-trip flights\n\n`;
  
  itinerary.days.forEach(day => {
    fullText += `\n${day.title}\n`;
    fullText += `Estimated Cost: $${day.estimated_cost}\n\n`;
    
    day.activities.forEach(activity => {
      fullText += `${activity.time} - ${activity.activity} (${activity.duration})\n`;
      fullText += `${activity.description}\n\n`;
    });
    
    fullText += 'Meals:\n';
    day.meals.forEach(meal => {
      fullText += `• ${meal.time}: ${meal.meal} at ${meal.location}\n`;
    });
    fullText += '\n';
  });

  fullText += '\nTravel Tips:\n';
  itinerary.travel_tips.forEach(tip => {
    fullText += `• ${tip}\n`;
  });

  itinerary.full_itinerary = fullText;
  itinerary.generated_by = 'fallback';
  itinerary.generated_at = new Date().toISOString();

  return itinerary;
}

// Helper functions
function calculateEstimatedCost(budgetRange, days) {
  const budgetMap = {
    'Day Trip ($20-$150)': 100,
    'Budget ($150-$500)': 300,
    'Mid-range ($500-$1000)': 750,
    'Luxury ($1000+)': 1500
  };
  
  const baseCost = budgetMap[budgetRange] || 750;
  return baseCost * days;
}

function calculateDayCost(budgetRange, day) {
  const budgetMap = {
    'Day Trip ($20-$150)': 100,
    'Budget ($150-$500)': 300,
    'Mid-range ($500-$1000)': 750,
    'Luxury ($1000+)': 1500
  };
  
  return budgetMap[budgetRange] || 750;
}

function getDayTitle(day, destination) {
  const titles = [
    `Arrival in ${destination}`,
    `Exploring ${destination}`,
    `Cultural Discovery`,
    `Adventure Day`,
    `Local Experiences`,
    `Hidden Gems`,
    `Farewell ${destination}`
  ];
  
  return titles[day - 1] || `Day ${day} in ${destination}`;
}

module.exports = router;
