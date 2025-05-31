import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  style?: any; // To support style prop in place of className
}

// Define custom colors for variants
const COLORS = {
  primary: '#3B82F6', // Equivalent to primary-500
  primaryActive: '#2563EB', // Equivalent to primary-600
  secondary: '#6B7280', // Equivalent to secondary-500
  secondaryActive: '#4B5563', // Equivalent to secondary-600
  error: '#EF4444', // Equivalent to error-500
  errorActive: '#DC2626', // Equivalent to error-600
  gray300: '#D1D5DB',
  gray100: '#F3F4F6',
  gray700: '#374151',
  white: '#FFFFFF',
};

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  style, 
  disabled, 
  loading,
  ...props 
}: ButtonProps) => {
  const baseStyles = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: COLORS.primary,
      // Note: active:bg-primary-600 handled via activeOpacity
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      // Note: active:bg-secondary-600 handled via activeOpacity
    },
    outline: {
      borderWidth: 1,
      borderColor: COLORS.gray300,
      // Note: active:bg-gray-100 handled via activeOpacity
    },
    ghost: {
      // Note: active:bg-gray-100 handled via activeOpacity
    },
    danger: {
      backgroundColor: COLORS.error,
      // Note: active:bg-error-600 handled via activeOpacity
    },
  };
  
  const sizeStyles = {
    sm: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    md: {
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    lg: {
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
  };
  
  const textBaseStyles = {
    fontWeight: '500',
    textAlign: 'center',
  };
  
  const textVariantStyles = {
    primary: {
      color: COLORS.white,
    },
    secondary: {
      color: COLORS.white,
    },
    outline: {
      color: COLORS.gray700,
    },
    ghost: {
      color: COLORS.gray700,
    },
    danger: {
      color: COLORS.white,
    },
  };
  
  const textSizeStyles = {
    sm: {
      fontSize: 12,
    },
    md: {
      fontSize: 14,
    },
    lg: {
      fontSize: 16,
    },
  };
  
  const isDisabled = disabled || loading;
  const disabledStyles = isDisabled ? { opacity: 0.5 } : {};
  
  return (
    <TouchableOpacity
      style={[ 
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabledStyles,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7} // Handles active state visual feedback
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.gray700 : COLORS.white} 
          style={{ marginRight: 8 }}
        />
      ) : null}
      
      {typeof children === 'string' ? (
        <Text 
          style={[
            // @ts-ignore
            textBaseStyles,
            textVariantStyles[variant],
            textSizeStyles[size],
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
