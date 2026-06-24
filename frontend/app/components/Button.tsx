'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, children, className = '', onDrag, onDragEnd, onDragStart, onAnimationStart, onAnimationEnd, onAnimationIteration, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
    
    const variantClasses = {
      primary: 'btn-primary focus:ring-green-500',
      secondary: 'btn-secondary focus:ring-green-500',
      outline: 'btn-outline focus:ring-green-500',
      accent: 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-orange-500'
    };
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl'
    };
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
    
    return (
      <motion.button
        ref={ref}
        className={classes}
        whileHover={{ 
          scale: 1.02,
          y: -1
        }}
        whileTap={{ 
          scale: 0.98,
          y: 0
        }}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="loading-dots">
              <span style={{ '--i': 0 } as React.CSSProperties}></span>
              <span style={{ '--i': 1 } as React.CSSProperties}></span>
              <span style={{ '--i': 2 } as React.CSSProperties}></span>
            </div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="relative z-10"
          >
            {children}
          </motion.span>
        )}
        
        {/* Ripple effect overlay */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0"
          whileTap={{
            opacity: [0, 0.2, 0],
            scale: [0, 1, 1.2]
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
