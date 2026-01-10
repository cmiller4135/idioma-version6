import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Achievement, ACHIEVEMENTS } from '../components/Gamification/AchievementModal';

interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
  wordsLearned: number;
  quizzesCompleted: number;
  minutesToday: number;
  lastActivityDate: string | null;
  unlockedAchievements: string[];
}

interface UseGamificationReturn {
  stats: GamificationStats;
  loading: boolean;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  recordActivity: () => void;
  checkAchievement: (achievementId: string) => Achievement | null;
  getLevel: (xp: number) => number;
  getXPToNextLevel: (level: number) => number;
  refreshStats: () => Promise<void>;
}

const XP_PER_LEVEL = 100;
const LEVEL_MULTIPLIER = 1.5;

const DEFAULT_STATS: GamificationStats = {
  xp: 0,
  level: 1,
  streak: 0,
  wordsLearned: 0,
  quizzesCompleted: 0,
  minutesToday: 0,
  lastActivityDate: null,
  unlockedAchievements: []
};

export const useGamification = (): UseGamificationReturn => {
  const [stats, setStats] = useState<GamificationStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Calculate level from XP
  const getLevel = useCallback((xp: number): number => {
    let level = 1;
    let xpNeeded = XP_PER_LEVEL;
    let totalXP = 0;

    while (totalXP + xpNeeded <= xp) {
      totalXP += xpNeeded;
      level++;
      xpNeeded = Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
    }

    return level;
  }, []);

  // Calculate XP needed for next level
  const getXPToNextLevel = useCallback((level: number): number => {
    return Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }, []);

  // Load stats from localStorage and database
  const loadStats = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        // Load from localStorage first (for fast initial load)
        const localStats = localStorage.getItem(`gamification_${user.id}`);
        if (localStats) {
          const parsed = JSON.parse(localStats);
          setStats(parsed);
        }

        // Get word count from database
        const { count } = await supabase
          .from('vocabulary')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get profile data for login streak info
        const { data: profile } = await supabase
          .from('profiles')
          .select('login_count, login_updated')
          .eq('id', user.id)
          .single();

        // Calculate streak from login data
        let currentStreak = 0;
        if (profile?.login_updated) {
          const lastLogin = new Date(profile.login_updated);
          const today = new Date();
          const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays <= 1) {
            currentStreak = profile.login_count || 0;
          }
        }

        setStats(prev => {
          const newStats = {
            ...prev,
            wordsLearned: count || 0,
            streak: currentStreak,
            level: getLevel(prev.xp)
          };

          // Save to localStorage
          localStorage.setItem(`gamification_${user.id}`, JSON.stringify(newStats));

          return newStats;
        });
      }
    } catch (error) {
      console.error('Error loading gamification stats:', error);
    } finally {
      setLoading(false);
    }
  }, [getLevel]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Save stats to localStorage whenever they change
  const saveStats = useCallback((newStats: GamificationStats) => {
    if (userId) {
      localStorage.setItem(`gamification_${userId}`, JSON.stringify(newStats));
    }
  }, [userId]);

  // Add XP
  const addXP = useCallback((amount: number) => {
    setStats(prev => {
      const newXP = prev.xp + amount;
      const newLevel = getLevel(newXP);
      const newStats = {
        ...prev,
        xp: newXP,
        level: newLevel
      };
      saveStats(newStats);
      return newStats;
    });
  }, [getLevel, saveStats]);

  // Increment streak
  const incrementStreak = useCallback(() => {
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0];

      if (prev.lastActivityDate === today) {
        return prev; // Already recorded today
      }

      const lastDate = prev.lastActivityDate ? new Date(prev.lastActivityDate) : null;
      const todayDate = new Date(today);

      let newStreak = 1;
      if (lastDate) {
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = prev.streak + 1;
        } else if (diffDays === 0) {
          newStreak = prev.streak;
        }
      }

      const newStats = {
        ...prev,
        streak: newStreak,
        lastActivityDate: today
      };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // Record activity (updates minutes today)
  const recordActivity = useCallback(() => {
    setStats(prev => {
      const newStats = {
        ...prev,
        minutesToday: prev.minutesToday + 1
      };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // Check and unlock achievement
  const checkAchievement = useCallback((achievementId: string): Achievement | null => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);

    if (!achievement) return null;

    if (stats.unlockedAchievements.includes(achievementId)) {
      return null; // Already unlocked
    }

    // Unlock the achievement
    setStats(prev => {
      const newStats = {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, achievementId],
        xp: prev.xp + (achievement.xpReward || 0)
      };
      saveStats(newStats);
      return newStats;
    });

    return {
      ...achievement,
      unlockedAt: new Date()
    };
  }, [stats.unlockedAchievements, saveStats]);

  // Refresh stats from database
  const refreshStats = useCallback(async () => {
    setLoading(true);
    await loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    addXP,
    incrementStreak,
    recordActivity,
    checkAchievement,
    getLevel,
    getXPToNextLevel,
    refreshStats
  };
};

export default useGamification;
