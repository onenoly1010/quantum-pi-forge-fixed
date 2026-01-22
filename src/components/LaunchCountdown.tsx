'use client';

import React, { useState, useEffect } from 'react';

const LaunchCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2025-12-17T23:59:59Z');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isLaunched = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-4 text-center">
      <div className="max-w-4xl mx-auto">
        {!isLaunched ? (
          <>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              🚀 GENESIS LAUNCH COUNTDOWN
            </h2>
            <div className="flex justify-center items-center space-x-4 md:space-x-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[80px]">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm text-white/80 uppercase">Hours</div>
              </div>
              <div className="text-2xl md:text-3xl text-white font-bold">:</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[80px]">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm text-white/80 uppercase">Minutes</div>
              </div>
              <div className="text-2xl md:text-3xl text-white font-bold">:</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[80px]">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm text-white/80 uppercase">Seconds</div>
              </div>
            </div>
            <p className="text-white/90 mt-3 text-sm md:text-base">
              OINIO Token Launch • December 17, 2025 • 23:59:59 UTC
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 animate-pulse">
              🎉 GENESIS LAUNCH IS LIVE! 🎉
            </h2>
            <p className="text-white/90 text-base md:text-lg">
              The OINIO ecosystem is now operational. Connect your wallet to participate!
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LaunchCountdown;
