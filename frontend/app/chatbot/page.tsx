'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, RotateCcw, MapPin, Star, Calendar, Users } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import Button from '../components/Button';
import { useChatStore } from '../utils/store';
import { chatAPI, packagesAPI } from '../utils/api';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: any[];
}

const ChatbotPage = () => {
  const { messages, addMessage, setLoading, isLoading } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: inputMessage.trim(),
    };

    addMessage(userMessage);
    const messageText = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    try {
      // Use public message endpoint (no authentication needed)
      const response = await chatAPI.sendPublicMessage({
        message: messageText
      });

      console.log('Chat response:', response);

      // Add AI response to chat
      if (response.data?.data?.content) {
        addMessage({
          role: 'ai',
          content: response.data.data.content
        });
      } else if (response.data?.data?.message) {
        addMessage({
          role: 'ai',
          content: response.data.data.message
        });
      } else {
        // Fallback to local response generation
        const localResponse = await generateIntelligentResponse(messageText);
        addMessage({
          role: 'ai',
          content: localResponse.content
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to local response generation
      const localResponse = await generateIntelligentResponse(messageText);
      addMessage({
        role: 'ai',
        content: localResponse.content
      });
    } finally {
      setLoading(false);
    }
  };

  const generateIntelligentResponse = async (userInput: string) => {
    const input = userInput.toLowerCase();
    
    try {
      // Try to fetch packages from API
      const packagesResponse = await packagesAPI.getAll({
        search: input,
        limit: 5
      });
      
      const availablePackages = packagesResponse.data || [];
      
      // Check for specific destinations
      const destinationKeywords = ['bali', 'swiss', 'alps', 'tokyo', 'japan', 'santorini', 'greece', 'africa', 'kenya', 'iceland'];
      const foundDestination = destinationKeywords.find(dest => input.includes(dest));
      
      // Check for activity types
      const activityKeywords = ['adventure', 'cultural', 'romantic', 'beach', 'mountain', 'city', 'safari', 'northern lights'];
      const foundActivity = activityKeywords.find(activity => input.includes(activity));
      
      // Check for budget mentions
      const budgetKeywords = ['budget', 'cheap', 'expensive', 'luxury', 'affordable'];
      const foundBudget = budgetKeywords.find(budget => input.includes(budget));
      
      // Find relevant packages
      let relevantPackages = availablePackages;
      
      if (foundDestination) {
        relevantPackages = availablePackages.filter((pkg: any) => 
          pkg.location?.toLowerCase().includes(foundDestination) || 
          pkg.name?.toLowerCase().includes(foundDestination)
        );
      }
      
      if (foundActivity) {
        relevantPackages = relevantPackages.filter((pkg: any) => 
          pkg.category?.toLowerCase().includes(foundActivity) ||
          pkg.highlights?.some((highlight: string) => highlight.toLowerCase().includes(foundActivity))
        );
      }
      
      if (foundBudget === 'budget' || foundBudget === 'cheap' || foundBudget === 'affordable') {
        relevantPackages = relevantPackages.filter((pkg: any) => pkg.price < 1000);
      } else if (foundBudget === 'luxury' || foundBudget === 'expensive') {
        relevantPackages = relevantPackages.filter((pkg: any) => pkg.price > 1500);
      }
      
      // Generate response based on findings
      let content = '';
      let suggestions: any[] = [];
      
      if (foundDestination && relevantPackages.length > 0) {
        content = `Great choice! I found some amazing packages for ${foundDestination}. Here are my top recommendations:`;
        suggestions = relevantPackages.slice(0, 3);
      } else if (foundActivity && relevantPackages.length > 0) {
        content = `Perfect! I have some fantastic ${foundActivity} experiences for you. Here are my top picks:`;
        suggestions = relevantPackages.slice(0, 3);
      } else if (relevantPackages.length > 0) {
        content = "I found some great travel options that match your interests! Here are my recommendations:";
        suggestions = relevantPackages.slice(0, 3);
      } else {
        content = "I'd love to help you find the perfect travel experience! Could you tell me more about your preferred destination, activities, or budget? I can suggest some amazing packages once I know more about what you're looking for.";
      }
      
      return { content, suggestions };
    } catch (error) {
      console.error('Error fetching packages for chat response:', error);
      return {
        content: "I'd love to help you find the perfect travel experience! Could you tell me more about your preferred destination, activities, or budget? I can suggest some amazing packages once I know more about what you're looking for.",
        suggestions: []
      };
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    // This will be handled by the store's clearMessages function
    window.location.reload(); // Simple way to reset the chat
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#0f1729' }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              WanderWild AI Assistant
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Ask me anything about travel, destinations, or packages!
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card h-[600px] flex flex-col"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <div key={message.id}>
                  <ChatBubble
                    role={message.role}
                    message={message.content}
                    timestamp={message.timestamp}
                  />
                </div>
              ))}
            </AnimatePresence>
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about destinations, packages, or travel planning..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-3"
                  title="Send message"
                >
                  <Send size={20} />
                </Button>
                <Button
                  variant="outline"
                  onClick={clearChat}
                  className="px-3 py-2"
                  title="Clear chat"
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Show me rural destinations",
              "Find adventure packages",
              "Budget travel options",
              "Cultural experiences",
              "Homestay options",
              "Local food tours",
              "Nature experiences",
              "Traditional crafts"
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(action);
                  // Auto-send the message after a short delay
                  setTimeout(() => {
                    const btn = document.querySelector('button[title="Send message"]') as HTMLButtonElement;
                    if (btn) btn.click();
                  }, 100);
                }}
                disabled={isLoading}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: '#0f1729',
                  color: '#0f1729'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#0f1729';
                    (e.target as HTMLButtonElement).style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLButtonElement).style.color = '#0f1729';
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatbotPage;
