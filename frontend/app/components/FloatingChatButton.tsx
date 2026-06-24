'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import Link from 'next/link';

const FloatingChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200 }}
    >
      <motion.div
        className="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
            >
              Chat with AI Assistant
              <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button */}
        <Link href="/chatbot">
          <motion.button
            className="w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center"
            style={{ backgroundColor: '#0f1729' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: [
                "0 4px 14px 0 rgba(15, 23, 41, 0.3)",
                "0 4px 14px 0 rgba(15, 23, 41, 0.5)",
                "0 4px 14px 0 rgba(15, 23, 41, 0.3)"
              ]
            }}
            transition={{ 
              boxShadow: { 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              } 
            }}
          >
            <MessageCircle size={24} />
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default FloatingChatButton;
