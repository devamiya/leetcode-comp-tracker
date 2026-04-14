import React, { useState, useEffect } from 'react';

/**
 * A component that animates a number from 0 (or a starting value) to a target value.
 * Can also optionally fluctuate slightly around the target value to simulate "live" activity.
 */
export default function AnimatedCounter({ 
  value, 
  duration = 1000, 
  formatter = (v) => v, 
  live = false,
  className = "" 
}) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animation logic
  useEffect(() => {
    let start = displayValue;
    const end = parseInt(value) || 0;
    if (start === end) return;

    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    // For large ranges, we need a faster increment than 1
    const fastIncrement = Math.ceil(Math.abs(range) / (duration / 16)); // 60fps

    const timer = setInterval(() => {
      current += (Math.abs(range) > 100 ? fastIncrement : 1) * increment;
      
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [value, duration]);

  // Live fluctuation logic
  useEffect(() => {
    if (!live || value === null) return;

    const driftInterval = setInterval(() => {
      setDisplayValue(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + delta;
        // Stay within +/- 3 of the target value
        if (Math.abs(newCount - value) > 3) return prev;
        return newCount;
      });
    }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds

    return () => clearInterval(driftInterval);
  }, [live, value]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
