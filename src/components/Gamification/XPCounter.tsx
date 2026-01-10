import React, { useEffect, useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';

interface XPCounterProps {
  xp: number;
  level?: number;
  xpToNextLevel?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  recentGain?: number;
}

const XPCounter: React.FC<XPCounterProps> = ({
  xp,
  level = 1,
  xpToNextLevel = 100,
  showProgress = true,
  size = 'md',
  animated = true,
  recentGain
}) => {
  const [displayXP, setDisplayXP] = useState(xp);
  const [showGain, setShowGain] = useState(false);

  useEffect(() => {
    if (animated && xp !== displayXP) {
      const diff = xp - displayXP;
      const steps = 20;
      const stepValue = diff / steps;
      let current = displayXP;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += stepValue;
        setDisplayXP(Math.round(current));

        if (step >= steps) {
          setDisplayXP(xp);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    } else {
      setDisplayXP(xp);
    }
  }, [xp, animated]);

  useEffect(() => {
    if (recentGain && recentGain > 0) {
      setShowGain(true);
      const timer = setTimeout(() => setShowGain(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentGain]);

  const xpInCurrentLevel = xp % xpToNextLevel;
  const progressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;

  const sizeClasses = {
    sm: { container: 'text-sm', icon: 'w-4 h-4', badge: 'w-6 h-6 text-xs' },
    md: { container: 'text-base', icon: 'w-5 h-5', badge: 'w-8 h-8 text-sm' },
    lg: { container: 'text-lg', icon: 'w-6 h-6', badge: 'w-10 h-10 text-base' }
  };

  const getLevelColor = () => {
    if (level >= 20) return 'from-purple-500 to-pink-500';
    if (level >= 10) return 'from-yellow-400 to-orange-500';
    if (level >= 5) return 'from-blue-400 to-blue-600';
    return 'from-green-400 to-green-600';
  };

  return (
    <div className={`flex items-center gap-3 ${sizeClasses[size].container}`}>
      {/* Level Badge */}
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size].badge} rounded-full
            bg-gradient-to-br ${getLevelColor()}
            flex items-center justify-center
            text-white font-bold shadow-lg
          `}
        >
          {level}
        </div>
        <Star
          className={`absolute -top-1 -right-1 ${sizeClasses[size].icon} text-yellow-400 fill-yellow-400`}
        />
      </div>

      {/* XP Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">
            {displayXP.toLocaleString()} XP
          </span>
          {showGain && recentGain && (
            <span className="text-success-500 font-medium animate-bounce flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{recentGain}
            </span>
          )}
        </div>

        {showProgress && (
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Level {level}</span>
              <span>{xpInCurrentLevel}/{xpToNextLevel} to Level {level + 1}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getLevelColor()} transition-all duration-500 ease-out`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XPCounter;
