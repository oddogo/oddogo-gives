
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'default' }) => {
  return (
    <img 
      src="/lovable-uploads/df9b1e7b-1296-4b04-80e6-bf6113ec93cc.png"
      alt="Oddogo Logo"
      className={`h-10 ${className || ''}`}
    />
  );
};
