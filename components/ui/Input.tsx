import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any; // To support style prop in place of className
}

// Define custom colors
const COLORS = {
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
  error: '#EF4444', // Equivalent to error-500
  placeholder: '#9CA3AF',
};

export const Input = ({ 
  label, 
  error, 
  helper,
  leftIcon,
  rightIcon,
  style,
  ...props 
}: InputProps) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: COLORS.gray700,
          marginBottom: 6,
        }}>
          {label}
        </Text>
      )}
      
      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{
            position: 'absolute',
            left: 12,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            zIndex: 10,
          }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[{
            width: '100%',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? COLORS.error : COLORS.gray300,
            backgroundColor: COLORS.white,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 16,
            color: COLORS.gray900,
            ...(leftIcon ? { paddingLeft: 40 } : {}),
            ...(rightIcon ? { paddingRight: 40 } : {}),
          }, style]}
          placeholderTextColor={COLORS.placeholder}
          {...props}
        />
        
        {rightIcon && (
          <View style={{
            position: 'absolute',
            right: 12,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            zIndex: 10,
          }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error ? (
        <Text style={{
          marginTop: 4,
          fontSize: 12,
          color: COLORS.error,
        }}>{error}</Text>
      ) : helper ? (
        <Text style={{
          marginTop: 4,
          fontSize: 12,
          color: COLORS.gray500,
        }}>{helper}</Text>
      ) : null}
    </View>
  );
};
