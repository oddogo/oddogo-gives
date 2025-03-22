
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'default' }) => {
  return (
    <img 
      src="/lovable-uploads/b7702484-a438-4044-b5ef-cc6fbc31513f.png"
      alt="Oddogo Logo"
      className={`h-12 ${className || ''}`}
    />
  );
};
