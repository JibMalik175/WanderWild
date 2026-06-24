'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  floatingLabel?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, floatingLabel = false, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="w-full relative">
        {floatingLabel && label ? (
          <div className="relative">
            <input
              ref={ref}
              className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder=" "
              {...props}
            />
            <label className={`label-float ${isFocused || hasValue ? 'floating' : ''}`}>
              {label}
            </label>
          </div>
        ) : (
          <>
            {label && (
              <motion.label 
                className="block text-sm font-medium text-gray-700 mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.label>
            )}
            <input
              ref={ref}
              className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              {...props}
            />
          </>
        )}
        
        <AnimatePresence>
          {error && (
            <motion.p 
              className="mt-2 text-sm text-red-600 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="w-4 h-4 mr-2"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                ⚠️
              </motion.span>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {helperText && !error && (
          <motion.p 
            className="mt-2 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
