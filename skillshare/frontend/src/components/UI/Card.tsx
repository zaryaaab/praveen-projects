import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer' : '';
  
  const classes = `bg-white rounded-xl shadow-sm border border-gray-200 ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  return <div className={classes}>{children}</div>;
};

export default Card;