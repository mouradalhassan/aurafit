import React from 'react';
import './Card.css';

const Card = ({ children, className = '', variant = 'default', ...props }) => {
  return (
    <div className={`card card-${variant} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
