import { useState, useEffect } from 'react';

const Timer = ({ timeLimit, onTimeUp, isPaused }) => {
  const [remainingTime, setRemainingTime] = useState(timeLimit);

  useEffect(() => {
    setRemainingTime(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (isPaused || remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, remainingTime, onTimeUp]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const getColorClass = () => {
    if (remainingTime <= 10) return 'text-red-500';
    if (remainingTime <= 30) return 'text-yellow-500';
    return 'text-blue-500';
  };

  return (
    <div className={`text-4xl font-bold ${getColorClass()} transition-colors`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

export default Timer;
