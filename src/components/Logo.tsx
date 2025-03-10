
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img 
      src="/lovable-uploads/73c9c40f-6400-4389-aec9-42268145ca00.png"
      alt="Oddogo Logo"
      className={`h-12 md:h-16 ${className || ''}`}
    />
  );
};
