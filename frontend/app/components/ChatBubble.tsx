'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  message: string;
  timestamp?: Date | string | number;
}

const ChatBubble = ({ role, message, timestamp }: ChatBubbleProps) => {
  const isUser = role === 'user';
  
  // Convert timestamp to Date object if needed
  const getFormattedTime = () => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        {/* Message Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          
          {/* Timestamp */}
          {timestamp && getFormattedTime() && (
            <div className={`text-xs mt-1 ${
              isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {getFormattedTime()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
