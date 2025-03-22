
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'default' }) => {
  return (
    <img 
      src="/lovable-uploads/0358e0d1-787b-4c48-aeb4-d23c507732e3.png"
      alt="Oddogo Logo"
      className={`h-12 ${className || ''}`}
    />
  );
};
