'use client';

import { useState } from 'react';
import { aiItineraryAPI } from '../utils/api';
import { motion } from 'framer-motion';
import Button from '../components/Button';

const AIItineraryPage = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3-5 days');
  const [interests, setInterests] = useState<string[]>(['Culture & History']);
  const [budget, setBudget] = useState('Budget ($150-$500)');
  const [plan, setPlan] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (!destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    try {
      setLoading(true);

      const itineraryData = {
        from_location: fromLocation.trim() || 'Your Location',
        destination: destination.trim(),
        duration: days,
        budget: budget,
        interests: interests
      };

      // Use the public generate endpoint (no auth required)
      const response = await aiItineraryAPI.generatePublic(itineraryData);
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.itinerary) {
        // Convert the AI-generated itinerary to array format for display
        const itineraryText = response.data.itinerary;
        const itineraryArray = [
          `📍 Destination: ${destination}`,
          `📅 Duration: ${days}`,
          `💰 Budget: ${budget}`,
          `🎯 Interests: ${interests.join(', ')}`,
          '',
          '─'.repeat(50),
          '',
          ...itineraryText.split('\n').filter((line: string) => line.trim())
        ];
        setPlan(itineraryArray);
      } else {
        // Fallback to sample data if API doesn't return expected format
        alert('Itinerary generated but in unexpected format. Please try again.');
        const draft = [
          `Destination: ${destination}`,
          `Duration: ${days}`,
          `Budget: ${budget}`,
          `Interests: ${interests.join(', ')}`,
          '',
          'Day 1: Arrival & Introduction',
          '• Arrive at destination, check-in at accommodation',
          '• Explore local area and get oriented',
          '• Evening dinner at local restaurant',
          '',
          'Day 2: Cultural Exploration',
          '• Visit local landmarks and cultural sites',
          '• Experience traditional activities',
          '• Enjoy local cuisine and entertainment',
          '',
          'Day 3: Adventure & Nature',
          '• Outdoor activities and nature exploration',
          '• Adventure experiences based on interests',
          '• Relaxation and local interaction',
          '',
          'Day 4: Departure',
          '• Final breakfast and checkout',
          '• Transfer to departure point'
        ];
        setPlan(draft);
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestChange = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Create Your Perfect Itinerary
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Our AI-powered itinerary generator creates personalized travel plans based on your preferences, budget, and timeframe.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Itinerary Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <div className="space-y-6">
              {/* Where are you traveling from? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where are you traveling from? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., New York, London, Tokyo"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">This helps us provide flight and transportation recommendations</p>
              </div>

              {/* Where do you want to go? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where do you want to go?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Thailand, Europe, Bali"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                />
              </div>

              {/* How many days? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many days?
                </label>
                <select 
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                >
                  <option>3-5 days</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                </select>
              </div>

              {/* What are your interests? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your interests?
                </label>
                <div className="space-y-2">
                  {[
                    'Culture & History',
                    'Food & Cuisine',
                    'Adventure & Outdoors',
                    'Relaxation & Wellness',
                    'Shopping & Entertainment',
                    'Nature & Wildlife',
                    'Art & Museums',
                    'Nightlife'
                  ].map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={interests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                        className="mr-3 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select multiple options that interest you</p>
              </div>

              {/* Budget per person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget per person
                </label>
                <select 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                >
                  <option>Day Trip ($20-$150)</option>
                  <option>Budget ($150-$500)</option>
                  <option>Mid-range ($500-$1000)</option>
                  <option>Luxury ($1000+)</option>
                </select>
              </div>

              {/* Generate Itinerary Button */}
              <button 
                onClick={generatePlan}
                disabled={loading}
                className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Itinerary'}
              </button>
            </div>
          </motion.div>

          {/* Right: Sample AI-Generated Itinerary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your AI-Generated Itinerary</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">AI Generated</span>
            </div>

            {!plan ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-600">Fill the form and click Generate to see your personalized itinerary.</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Your Personalized Itinerary</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ AI Generated</span>
                  </div>
                  <p className="text-gray-600 text-sm">Created based on your preferences and interests</p>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {plan.map((line, index) => {
                    // Enhanced formatting for different line types
                    const isDay = line.match(/^(Day \d+|## Day \d+)/i);
                    const isHeader = line.startsWith('##') || line.startsWith('#');
                    const isBullet = line.startsWith('•') || line.startsWith('- ');
                    const isEmoji = line.match(/^[📍📅💰🎯]/);
                    const isDivider = line.startsWith('─');
                    const isNumbered = line.match(/^\d+\./);
                    const isBold = line.includes('**');
                    
                    return (
                      <div key={index} className={`
                        ${isDay ? 'border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 rounded-r mt-4 mb-2' : ''}
                        ${isBullet ? 'pl-6' : ''}
                        ${isNumbered ? 'pl-4' : ''}
                      `}>
                        {isDay ? (
                          <h4 className="font-bold text-gray-900 text-base">{line.replace(/^##?\s*/, '')}</h4>
                        ) : isHeader && !isDay ? (
                          <h5 className="font-semibold text-gray-800 text-sm mt-3 mb-1">{line.replace(/^##?\s*/, '')}</h5>
                        ) : isBullet ? (
                          <p className="text-sm text-gray-700 leading-relaxed">{line}</p>
                        ) : isEmoji ? (
                          <p className="text-sm font-medium text-gray-800 mb-1">{line}</p>
                        ) : isDivider ? (
                          <hr className="my-3 border-gray-200" />
                        ) : line === '' ? (
                          <div className="h-1"></div>
                        ) : isBold ? (
                          <p className="text-sm text-gray-700 leading-relaxed font-semibold">{line.replace(/\*\*/g, '')}</p>
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed">{line}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Save as PDF
                  </button>
                  <button 
                    onClick={() => window.location.href = '/packages'}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Matching Tours
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIItineraryPage;
