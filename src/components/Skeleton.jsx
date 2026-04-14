import React from 'react';

export default function Skeleton({ type, count = 1, className = "" }) {
  const skeletons = Array.from({ length: count });

  const getStyles = () => {
    switch (type) {
      case 'card':
        return { height: '140px', borderRadius: '16px' };
      case 'text':
        return { height: '1rem', borderRadius: '4px', width: '100%' };
      case 'title':
        return { height: '1.5rem', borderRadius: '4px', width: '60%' };
      case 'table-row':
        return { height: '48px', borderRadius: '4px', marginBottom: '8px' };
      default:
        return {};
    }
  };

  return (
    <>
      {skeletons.map((_, i) => (
        <div 
          key={i} 
          className={`skeleton-base ${className}`}
          style={getStyles()}
        />
      ))}
    </>
  );
}
