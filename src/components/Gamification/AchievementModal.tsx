import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trophy, Star, Flame, BookOpen, Target, Zap, Award, Medal } from 'lucide-react';
import { Button } from '../ui';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'flame' | 'book' | 'target' | 'zap' | 'award' | 'medal';
  color: 'gold' | 'silver' | 'bronze' | 'purple' | 'blue' | 'green';
  xpReward?: number;
  unlockedAt?: Date;
}

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  book: BookOpen,
  target: Target,
  zap: Zap,
  award: Award,
  medal: Medal
};

const colorMap = {
  gold: 'from-yellow-400 to-yellow-600',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-orange-400 to-orange-600',
  purple: 'from-purple-400 to-purple-600',
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600'
};

const bgColorMap = {
  gold: 'bg-yellow-50',
  silver: 'bg-gray-50',
  bronze: 'bg-orange-50',
  purple: 'bg-purple-50',
  blue: 'bg-blue-50',
  green: 'bg-green-50'
};

const AchievementModal: React.FC<AchievementModalProps> = ({
  achievement,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation('home');
  const [show, setShow] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 50);
      setTimeout(() => setShowConfetti(true), 300);
    } else {
      setShow(false);
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!isOpen || !achievement) return null;

  const IconComponent = iconMap[achievement.icon];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          show ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random()}s`
              }}
            >
              <div
                className={`w-3 h-3 ${
                  ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl max-w-sm w-full
          transform transition-all duration-500
          ${show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className={`p-8 text-center ${bgColorMap[achievement.color]} rounded-t-2xl`}>
          {/* Icon with glow */}
          <div className="relative inline-block mb-4">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${colorMap[achievement.color]} rounded-full blur-xl opacity-50 animate-pulse`}
              style={{ transform: 'scale(1.5)' }}
            />
            <div
              className={`
                relative w-24 h-24 rounded-full
                bg-gradient-to-br ${colorMap[achievement.color]}
                flex items-center justify-center
                shadow-xl animate-bounce
              `}
              style={{ animationDuration: '2s' }}
            >
              <IconComponent className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Achievement unlocked text */}
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t('gamification.achievement.unlocked')}
          </p>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {achievement.title}
          </h2>
        </div>

        <div className="p-6 text-center">
          {/* Description */}
          <p className="text-gray-600 mb-4">
            {achievement.description}
          </p>

          {/* XP Reward */}
          {achievement.xpReward && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 rounded-full mb-6">
              <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
              <span className="font-semibold text-accent-700">
                {t('gamification.achievement.xpReward', { xp: achievement.xpReward })}
              </span>
            </div>
          )}

          {/* Close button */}
          <Button onClick={onClose} className="w-full">
            {t('gamification.achievement.awesome')}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

export default AchievementModal;

// Pre-defined achievements for the app
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_word',
    title: 'First Steps',
    description: 'Added your first word to vocabulary',
    icon: 'book',
    color: 'bronze',
    xpReward: 10
  },
  {
    id: 'ten_words',
    title: 'Word Collector',
    description: 'Added 10 words to your vocabulary',
    icon: 'star',
    color: 'silver',
    xpReward: 25
  },
  {
    id: 'fifty_words',
    title: 'Vocabulary Master',
    description: 'Added 50 words to your vocabulary',
    icon: 'trophy',
    color: 'gold',
    xpReward: 100
  },
  {
    id: 'first_quiz',
    title: 'Quiz Taker',
    description: 'Completed your first quiz',
    icon: 'target',
    color: 'bronze',
    xpReward: 15
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Score',
    description: 'Got 100% on a quiz',
    icon: 'medal',
    color: 'gold',
    xpReward: 50
  },
  {
    id: 'three_day_streak',
    title: 'Getting Started',
    description: 'Maintained a 3-day learning streak',
    icon: 'flame',
    color: 'bronze',
    xpReward: 20
  },
  {
    id: 'seven_day_streak',
    title: 'On a Roll',
    description: 'Maintained a 7-day learning streak',
    icon: 'flame',
    color: 'silver',
    xpReward: 50
  },
  {
    id: 'thirty_day_streak',
    title: 'Unstoppable',
    description: 'Maintained a 30-day learning streak',
    icon: 'flame',
    color: 'gold',
    xpReward: 200
  },
  {
    id: 'first_translation',
    title: 'Translator',
    description: 'Used the photo or audio translation',
    icon: 'zap',
    color: 'blue',
    xpReward: 15
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reached level 5',
    icon: 'award',
    color: 'purple',
    xpReward: 75
  }
];
