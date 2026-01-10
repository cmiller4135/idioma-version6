import React, { useState, useCallback } from 'react';
import {
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button, Card, ProgressBar } from '../ui';

export interface FlashcardWord {
  id: string;
  word: string;
  translation: string;
  exampleSentence?: string;
  familiarity: 0 | 1 | 2 | 3 | 4; // 0 = new, 4 = mastered
  lastReviewed?: Date;
  nextReview?: Date;
}

interface FlashcardDeckProps {
  words: FlashcardWord[];
  onUpdateFamiliarity?: (wordId: string, familiarity: 0 | 1 | 2 | 3 | 4) => void;
  onComplete?: (results: { correct: number; incorrect: number; total: number }) => void;
  showTranslationFirst?: boolean;
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  words,
  onUpdateFamiliarity,
  onComplete,
  showTranslationFirst = false
}) => {
  const [deck, setDeck] = useState<FlashcardWord[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<{ correct: string[]; incorrect: string[] }>({
    correct: [],
    incorrect: []
  });
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = deck[currentIndex];
  const progress = ((currentIndex + 1) / deck.length) * 100;

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
    setShowHint(false);
  }, [isFlipped]);

  const handleKnew = useCallback(() => {
    if (!currentCard) return;

    setResults(prev => ({
      ...prev,
      correct: [...prev.correct, currentCard.id]
    }));

    const newFamiliarity = Math.min(currentCard.familiarity + 1, 4) as 0 | 1 | 2 | 3 | 4;
    onUpdateFamiliarity?.(currentCard.id, newFamiliarity);

    moveToNext();
  }, [currentCard, onUpdateFamiliarity]);

  const handleDidntKnow = useCallback(() => {
    if (!currentCard) return;

    setResults(prev => ({
      ...prev,
      incorrect: [...prev.incorrect, currentCard.id]
    }));

    const newFamiliarity = Math.max(currentCard.familiarity - 1, 0) as 0 | 1 | 2 | 3 | 4;
    onUpdateFamiliarity?.(currentCard.id, newFamiliarity);

    moveToNext();
  }, [currentCard, onUpdateFamiliarity]);

  const moveToNext = () => {
    setIsFlipped(false);
    setShowHint(false);

    if (currentIndex >= deck.length - 1) {
      setIsComplete(true);
      onComplete?.({
        correct: results.correct.length + 1, // +1 for current
        incorrect: results.incorrect.length,
        total: deck.length
      });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setResults({ correct: [], incorrect: [] });
    setIsComplete(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setResults({ correct: [], incorrect: [] });
    setIsComplete(false);
  };

  const getFamiliarityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-400';
      case 2: return 'bg-orange-400';
      case 3: return 'bg-yellow-400';
      case 4: return 'bg-green-400';
      default: return 'bg-gray-200';
    }
  };

  const getFamiliarityLabel = (level: number) => {
    switch (level) {
      case 0: return 'New';
      case 1: return 'Learning';
      case 2: return 'Familiar';
      case 3: return 'Known';
      case 4: return 'Mastered';
      default: return 'Unknown';
    }
  };

  if (deck.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Cards to Review</h3>
          <p className="text-gray-500">Add some words to your vocabulary to start practicing!</p>
        </Card.Body>
      </Card>
    );
  }

  if (isComplete) {
    const correctCount = results.correct.length;
    const incorrectCount = results.incorrect.length;
    const percentage = Math.round((correctCount / deck.length) * 100);

    return (
      <Card>
        <Card.Body className="text-center py-8">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            percentage >= 80 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {percentage >= 80 ? (
              <Check className="w-10 h-10 text-green-500" />
            ) : percentage >= 50 ? (
              <RotateCcw className="w-10 h-10 text-yellow-500" />
            ) : (
              <X className="w-10 h-10 text-red-500" />
            )}
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h3>
          <p className="text-gray-500 mb-6">You reviewed {deck.length} cards</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-green-700">Correct</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
              <p className="text-sm text-red-700">Incorrect</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
              <p className="text-sm text-blue-700">Score</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
            <Button variant="secondary" onClick={handleShuffle}>
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle & Restart
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const frontContent = showTranslationFirst ? currentCard.translation : currentCard.word;
  const backContent = showTranslationFirst ? currentCard.word : currentCard.translation;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {deck.length}
        </span>
        <ProgressBar value={progress} max={100} size="sm" className="flex-1" />
        <button
          onClick={handleShuffle}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Shuffle deck"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* Flashcard */}
      <div
        className="relative h-64 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`
            absolute inset-0 w-full h-full
            transition-transform duration-500 transform-style-preserve-3d
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front */}
          <Card className="absolute inset-0 backface-hidden">
            <Card.Body className="h-full flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs text-white ${getFamiliarityColor(currentCard.familiarity)}`}>
                  {getFamiliarityLabel(currentCard.familiarity)}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 text-center">
                {frontContent}
              </p>
              <p className="text-sm text-gray-400 mt-4">Click to flip</p>
            </Card.Body>
          </Card>

          {/* Back */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180">
            <Card.Body className="h-full flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-primary-600 text-center mb-4">
                {backContent}
              </p>
              {currentCard.exampleSentence && (
                <div className="w-full max-w-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mx-auto"
                  >
                    {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showHint ? 'Hide example' : 'Show example'}
                  </button>
                  {showHint && (
                    <p className="text-sm text-gray-600 italic text-center mt-2">
                      "{currentCard.exampleSentence}"
                    </p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-4">
          <Button
            variant="danger"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleDidntKnow();
            }}
            className="px-8"
          >
            <X className="w-5 h-5 mr-2" />
            Didn't Know
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleKnew();
            }}
            className="px-8"
          >
            <Check className="w-5 h-5 mr-2" />
            Knew It
          </Button>
        </div>

        <button
          onClick={() => {
            if (currentIndex < deck.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setIsFlipped(false);
              setShowHint(false);
            }
          }}
          disabled={currentIndex >= deck.length - 1}
          className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default FlashcardDeck;
