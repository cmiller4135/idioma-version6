import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Languages,
  Camera,
  Mic,
  Sparkles,
  ArrowRight,
  Target,
  TrendingUp,
  Clock,
  Star,
  Trophy,
  Layers,
  Play
} from 'lucide-react';
import { Card, Button, Spinner } from '../components/ui';
import Breadcrumb from '../components/Breadcrumb';
import { StreakBadge, XPCounter, AchievementModal, Achievement, ACHIEVEMENTS } from '../components/Gamification';
import { FlashcardDeck, FlashcardWord } from '../components/Flashcard';
import useGamification from '../hooks/useGamification';
import { supabase } from '../lib/supabase';

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ to, icon, title, description, color }) => (
  <Link to={to} className="group">
    <Card hover className="h-full">
      <Card.Body className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color} text-white flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </Card.Body>
    </Card>
  </Link>
);

const Home: React.FC = () => {
  const { stats, loading, getXPToNextLevel } = useGamification();
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [flashcardWords, setFlashcardWords] = useState<FlashcardWord[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [showFlashcards, setShowFlashcards] = useState(false);

  // Load vocabulary words for flashcards
  useEffect(() => {
    const loadWords = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingWords(false);
          return;
        }

        const { data: words } = await supabase
          .from('vocabulary')
          .select('id, word, translation')
          .eq('user_id', user.id)
          .limit(20);

        if (words) {
          const flashcards: FlashcardWord[] = words.map(w => ({
            id: w.id,
            word: w.word,
            translation: w.translation,
            familiarity: 0 as const
          }));
          setFlashcardWords(flashcards);
        }
      } catch (error) {
        console.error('Error loading words:', error);
      } finally {
        setLoadingWords(false);
      }
    };

    loadWords();
  }, []);

  // Check for achievements based on stats
  useEffect(() => {
    // Check streak achievements
    if (stats.streak >= 3 && !stats.unlockedAchievements.includes('three_day_streak')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'three_day_streak');
      if (achievement) {
        setCurrentAchievement({ ...achievement, unlockedAt: new Date() });
        setShowAchievement(true);
      }
    }

    // Check word count achievements
    if (stats.wordsLearned >= 1 && !stats.unlockedAchievements.includes('first_word')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first_word');
      if (achievement) {
        setCurrentAchievement({ ...achievement, unlockedAt: new Date() });
        setShowAchievement(true);
      }
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <Breadcrumb />

      {/* Welcome Section with Gamification */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome back!</h1>
            <p className="text-primary-100 text-base sm:text-lg">
              Continue your language learning journey.
            </p>
          </div>

          {/* Streak and XP Summary - Compact on mobile */}
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
            <StreakBadge streak={stats.streak} size="sm" showLabel={false} />
            <div className="h-8 sm:h-12 w-px bg-white/20 hidden sm:block" />
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold">{stats.xp.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-primary-200">XP</p>
            </div>
            <div className="h-8 sm:h-12 w-px bg-white/20 hidden sm:block" />
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold">Lvl {stats.level}</p>
              <p className="text-xs sm:text-sm text-primary-200">Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview with Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <Card.Body className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary-100 flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Words</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.wordsLearned}</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-success-100 flex-shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Quizzes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.quizzesCompleted}</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-warning-100 flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Minutes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.minutesToday}</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
            <StreakBadge streak={stats.streak} size="sm" showLabel={false} animated={false} />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Streak</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.streak}</p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* XP Progress */}
      <Card>
        <Card.Body>
          <XPCounter
            xp={stats.xp}
            level={stats.level}
            xpToNextLevel={getXPToNextLevel(stats.level)}
            showProgress={true}
            size="lg"
          />
        </Card.Body>
      </Card>

      {/* Flashcard Quick Practice */}
      {!loadingWords && flashcardWords.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent-500" />
                Quick Flashcard Practice
              </h2>
              <Button
                variant={showFlashcards ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setShowFlashcards(!showFlashcards)}
              >
                {showFlashcards ? 'Hide Cards' : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Practice Now
                  </>
                )}
              </Button>
            </div>
          </Card.Header>
          {showFlashcards && (
            <Card.Body>
              <FlashcardDeck
                words={flashcardWords}
                onComplete={(results) => {
                  console.log('Flashcard session complete:', results);
                }}
              />
            </Card.Body>
          )}
          {!showFlashcards && (
            <Card.Body>
              <p className="text-gray-500 text-center py-4">
                You have {flashcardWords.length} words ready to practice. Click "Practice Now" to start!
              </p>
            </Card.Body>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            to="/tools/sub2"
            icon={<BookOpen className="w-6 h-6" />}
            title="My Vocabulary"
            description="Review and manage your saved words and lists"
            color="bg-primary-500"
          />
          <QuickAction
            to="/tools/sub1"
            icon={<Languages className="w-6 h-6" />}
            title="Verb Conjugator"
            description="Practice Spanish verb conjugations"
            color="bg-accent-500"
          />
          <QuickAction
            to="/teach/sub1"
            icon={<Camera className="w-6 h-6" />}
            title="Photo Translation"
            description="Translate text from photos instantly"
            color="bg-success-500"
          />
          <QuickAction
            to="/saas2"
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Language Study"
            description="Learn with AI-generated content and quizzes"
            color="bg-warning-500"
          />
        </div>
      </div>

      {/* Learning Tools & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Tools */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary-500" />
              Learning Tools
            </h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <Link
              to="/tools/sub1"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Verb Conjugator</p>
                  <p className="text-sm text-gray-500">Master verb forms</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </Link>
            <Link
              to="/tools/sub3"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Topic Vocabulary</p>
                  <p className="text-sm text-gray-500">Learn words by subject</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </Link>
          </Card.Body>
          <Card.Footer>
            <Link to="/tools" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all tools
            </Link>
          </Card.Footer>
        </Card>

        {/* Achievements */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-3 gap-3">
              {ACHIEVEMENTS.slice(0, 6).map((achievement) => {
                const isUnlocked = stats.unlockedAchievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`
                      p-3 rounded-xl text-center transition-all
                      ${isUnlocked
                        ? 'bg-yellow-50 border-2 border-yellow-200'
                        : 'bg-gray-50 opacity-50'
                      }
                    `}
                    title={achievement.description}
                  >
                    <div className={`
                      w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2
                      ${isUnlocked ? 'bg-yellow-400' : 'bg-gray-300'}
                    `}>
                      <Trophy className={`w-5 h-5 ${isUnlocked ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {achievement.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card.Body>
          <Card.Footer>
            <p className="text-sm text-gray-500">
              {stats.unlockedAchievements.length} of {ACHIEVEMENTS.length} achievements unlocked
            </p>
          </Card.Footer>
        </Card>
      </div>

      {/* Multimedia Learning */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-success-500" />
            Multimedia Learning
          </h2>
        </Card.Header>
        <Card.Body className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to="/teach/sub1"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                <Camera className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Photo Translation</p>
                <p className="text-sm text-gray-500">Snap and translate</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
          </Link>
          <Link
            to="/teach/sub2"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                <Mic className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Audio Translation</p>
                <p className="text-sm text-gray-500">Speak and translate</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
          </Link>
        </Card.Body>
        <Card.Footer>
          <Link to="/teach" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all multimedia tools
          </Link>
        </Card.Footer>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200">
        <Card.Body>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent-500 rounded-xl text-white flex-shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Pro Tip</h3>
              <p className="text-gray-600">
                Consistency is key! Try to practice a little every day rather than long sessions once a week.
                Even 10 minutes of daily practice can lead to significant progress over time.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Achievement Modal */}
      <AchievementModal
        achievement={currentAchievement}
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </div>
  );
};

export default Home;
