import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Zap } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  size = 'md',
  showLabel = true,
  animated = true
}) => {
  const { t } = useTranslation('home');

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getStreakColor = () => {
    if (streak >= 30) return 'from-purple-500 to-pink-500';
    if (streak >= 14) return 'from-orange-500 to-red-500';
    if (streak >= 7) return 'from-yellow-500 to-orange-500';
    if (streak >= 3) return 'from-yellow-400 to-yellow-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakLabel = () => {
    if (streak >= 30) return t('gamification.streak.onFire');
    if (streak >= 14) return t('gamification.streak.blazing');
    if (streak >= 7) return t('gamification.streak.hotStreak');
    if (streak >= 3) return t('gamification.streak.gettingStarted');
    if (streak > 0) return t('gamification.streak.keepGoing');
    return t('gamification.streak.startStreak');
  };

  const isActive = streak > 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Glow effect for active streaks */}
        {isActive && animated && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getStreakColor()} rounded-full blur-md opacity-50 animate-pulse`}
          />
        )}

        {/* Main badge */}
        <div
          className={`
            relative ${sizeClasses[size]} rounded-full
            bg-gradient-to-br ${getStreakColor()}
            flex items-center justify-center
            text-white font-bold shadow-lg
            ${animated && isActive ? 'animate-bounce' : ''}
          `}
          style={{ animationDuration: '2s' }}
        >
          {isActive ? (
            <Flame className={iconSizes[size]} />
          ) : (
            <Zap className={iconSizes[size]} />
          )}
        </div>

        {/* Streak count badge */}
        {streak > 0 && (
          <div
            className={`
              absolute -bottom-1 -right-1
              bg-white rounded-full shadow-md
              flex items-center justify-center
              font-bold text-gray-800
              ${size === 'sm' ? 'w-4 h-4 text-[10px]' : size === 'md' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}
            `}
          >
            {streak}
          </div>
        )}
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">
            {streak} {streak !== 1 ? t('gamification.streak.days') : t('gamification.streak.day')}
          </span>
          <span className="text-xs text-gray-500">{getStreakLabel()}</span>
        </div>
      )}
    </div>
  );
};

export default StreakBadge;
