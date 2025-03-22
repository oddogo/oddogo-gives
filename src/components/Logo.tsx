
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img 
      src="/lovable-uploads/84d2bfc5-f954-419b-bc27-5208fd6f2676.png"
      alt="Oddogo Logo"
      className={`h-12 ${className || ''}`}
    />
  );
};
