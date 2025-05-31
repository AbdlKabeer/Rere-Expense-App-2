import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: any; // To support style prop in place of className
}

export const Card = ({ title, subtitle, children, style, ...props }: CardProps) => {
  return (
    <View 
      style={[{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
      }, style]} 
      {...props}
    >
      {(title || subtitle) && (
        <View style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}>
          {title && <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
          }}>{title}</Text>}
          {subtitle && <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginTop: 4,
          }}>{subtitle}</Text>}
        </View>
      )}
      <View style={{
        padding: 16,
      }}>
        {children}
      </View>
    </View>
  );
};

export const CardHeader = ({ children, style, ...props }: ViewProps) => {
  return (
    <View style={[{
      marginBottom: 8,
    }, style]} {...props}>
      {children}
    </View>
  );
};

export const CardContent = ({ children, style, ...props }: ViewProps) => {
  return (
    <View style={[{}, style]} {...props}>
      {children}
    </View>
  );
};

export const CardFooter = ({ children, style, ...props }: ViewProps) => {
  return (
    <View style={[{
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    }, style]} {...props}>
      {children}
    </View>
  );
};
