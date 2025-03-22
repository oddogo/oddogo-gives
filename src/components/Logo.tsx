
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'default' }) => {
  return (
    <img 
      src="/lovable-uploads/73c9c40f-6400-4389-aec9-42268145ca00.png"
      alt="Oddogo Logo"
      className={`h-12 md:h-16 ${variant === 'white' ? 'filter brightness-0 invert' : ''} ${className || ''}`}
    />
  );
};
