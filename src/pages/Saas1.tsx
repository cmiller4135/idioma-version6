import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  HelpCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { callOpenAI } from '../lib/edgeFunctions';
import { Card, Button, Input, Spinner, ProgressBar } from '../components/ui';
import Breadcrumb from '../components/Breadcrumb';
import useGamification from '../hooks/useGamification';
import { AchievementModal, Achievement, ACHIEVEMENTS } from '../components/Gamification';

interface GrokResponse {
  text: string;
  verbs: Array<{
    spanish: string;
    english: string;
    conjugation: string;
  }>;
  adjectives: Array<{
    spanish: string;
    english: string;
  }>;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

function Saas1() {
  const [loading, setLoading] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [response, setResponse] = useState<GrokResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Gamification
  const { addXP, checkAchievement, stats } = useGamification();
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);

    const prompt = `Please provide a response in the following format:

1. First, write a one paragraph summary of the current ${topic} in Spanish.

2. Then, write "VERBS:" on a new line, followed by a list of all Spanish verbs used in the summary. Format each verb on a new line like this:
[Spanish verb] - [English translation] - [conjugation description]

3. Then, write "ADJECTIVES:" on a new line, followed by a list of all Spanish adjectives used in the summary. Format each adjective on a new line like this:
[Spanish adjective] - [English translation]

Make sure to include ALL verbs and adjectives used in the summary, and ensure proper formatting with the dash separators.`;

    try {
      const data = await callOpenAI({
        type: 'chat',
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 1200,
        temperature: 0.4
      });

      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const content = data.choices[0].message.content;

      const textSection = content.split('VERBS:')[0].trim();
      const verbSection = content.split('VERBS:')[1]?.split('ADJECTIVES:')[0].trim() || '';
      const adjectiveSection = content.split('ADJECTIVES:')[1]?.trim() || '';

      const verbs = verbSection.split('\n')
        .filter((line: string) => line.trim() && line.includes('-'))
        .map((line: string) => {
          const parts = line.split('-').map(part => part.trim());
          return {
            spanish: parts[0] || '',
            english: parts[1] || '',
            conjugation: parts[2] || ''
          };
        });

      const adjectives = adjectiveSection.split('\n')
        .filter((line: string) => line.trim() && line.includes('-'))
        .map((line: string) => {
          const parts = line.split('-').map(part => part.trim());
          return {
            spanish: parts[0] || '',
            english: parts[1] || ''
          };
        });

      setResponse({
        text: textSection,
        verbs,
        adjectives
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!response) return;

    setLoadingQuiz(true);
    setError(null);
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);

    const quizPrompt = `Create a 5-question multiple choice quiz to test comprehension of the following Spanish paragraph. Questions should test vocabulary, grammar, and comprehension.

Text:
${response.text}

IMPORTANT: Format EXACTLY like this for each question (include the numbers and labels exactly as shown):

Question 1: [question text here]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
Correct: [A, B, C, or D]

Question 2: [question text here]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
Correct: [A, B, C, or D]

Continue for all 5 questions.`;

    try {
      const quizData = await callOpenAI({
        type: 'chat',
        model: "gpt-4o",
        messages: [{ role: "user", content: quizPrompt }],
        max_tokens: 2000,
        temperature: 0.4
      });

      if (!quizData?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const quizContent = quizData.choices[0].message.content;

      // Parse questions
      const questionBlocks = quizContent.split(/Question \d+:/).filter((block: string) => block.trim());

      const parsedQuestions: QuizQuestion[] = questionBlocks.map((block: string) => {
        const lines = block.trim().split('\n').filter((line: string) => line.trim());
        const question = lines[0]?.trim() || '';

        const options: string[] = [];
        let correctAnswer = '';

        lines.forEach((line: string) => {
          const optionMatch = line.match(/^([A-D])\)\s*(.+)/);
          if (optionMatch) {
            options.push(optionMatch[2].trim());
          }
          const correctMatch = line.match(/^Correct:\s*([A-D])/i);
          if (correctMatch) {
            const letterIndex = correctMatch[1].toUpperCase().charCodeAt(0) - 65;
            correctAnswer = options[letterIndex] || '';
          }
        });

        return { question, options, correctAnswer };
      }).filter((q: QuizQuestion) => q.question && q.options.length === 4);

      if (parsedQuestions.length === 0) {
        throw new Error('Could not parse quiz questions. Please try again.');
      }

      setQuiz(parsedQuestions);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (showResults) return; // Don't allow changes after submitting
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleCheckAnswers = () => {
    setShowResults(true);

    // Calculate XP reward based on score
    if (quiz) {
      let correct = 0;
      quiz.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswer) {
          correct++;
        }
      });

      const percentage = Math.round((correct / quiz.length) * 100);

      // Base XP for completing a quiz + bonus for correct answers
      const baseXP = 10;
      const correctBonus = correct * 5;
      const perfectBonus = percentage === 100 ? 25 : 0;
      const totalXP = baseXP + correctBonus + perfectBonus;

      setXpEarned(totalXP);
      addXP(totalXP);

      // Check for first quiz achievement
      if (!stats.unlockedAchievements.includes('first_quiz')) {
        const achievement = ACHIEVEMENTS.find(a => a.id === 'first_quiz');
        if (achievement) {
          setTimeout(() => {
            setCurrentAchievement({ ...achievement, unlockedAt: new Date() });
            setShowAchievement(true);
          }, 1500);
        }
      }

      // Check for perfect score achievement
      if (percentage === 100 && !stats.unlockedAchievements.includes('perfect_quiz')) {
        const achievement = ACHIEVEMENTS.find(a => a.id === 'perfect_quiz');
        if (achievement) {
          setTimeout(() => {
            setCurrentAchievement({ ...achievement, unlockedAt: new Date() });
            setShowAchievement(true);
          }, 2000);
        }
      }
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const getScore = () => {
    if (!quiz) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz.length,
      percentage: Math.round((correct / quiz.length) * 100)
    };
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  const handleDownloadDocx = () => {
    if (!response || !quiz) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Spanish Language Study Material",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Topic: ${topic}`,
                  italics: true,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Generated Content",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: response.text,
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Verb Analysis",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 100 },
            }),
            ...response.verbs.map(verb => new Paragraph({
              text: `• ${verb.spanish} - ${verb.english} - ${verb.conjugation}`,
              spacing: { after: 50 },
            })),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Adjective Analysis",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 200, after: 100 },
            }),
            ...response.adjectives.map(adj => new Paragraph({
              text: `• ${adj.spanish} - ${adj.english}`,
              spacing: { after: 50 },
            })),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Comprehension Quiz",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 200, after: 100 },
            }),
            ...quiz.flatMap((question, idx) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${idx + 1}. ${question.question}`,
                    bold: true,
                  }),
                ],
                spacing: { before: 150 },
              }),
              ...question.options.map((option, optIdx) => new Paragraph({
                text: `   ${String.fromCharCode(65 + optIdx)}) ${option}`,
              })),
              new Paragraph({
                text: `   Answer: ${question.correctAnswer}`,
                spacing: { after: 100 },
              }),
            ]),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `spanish_study_${topic.replace(/\s+/g, '_')}.docx`);
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Sparkles className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Spanish Content Generator</h1>
        </div>
        <p className="text-gray-600 ml-14">
          Generate Spanish content on any topic with vocabulary analysis and comprehension quizzes.
        </p>
      </div>

      {/* Topic Input */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-800">Choose Your Topic</h2>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Enter a topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Costa Rican history, Pokemon cards, climate change..."
              leftIcon={<FileText className="w-5 h-5" />}
              error={error && !response ? error : undefined}
            />
            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              rightIcon={<Send className="w-4 h-4" />}
            >
              {loading ? 'Generating...' : 'Generate Spanish Summary'}
            </Button>
          </form>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <Card.Body className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p className="text-gray-500">Generating Spanish content about "{topic}"...</p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Error Display */}
      {error && response && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {error}
        </div>
      )}

      {/* Generated Content */}
      {response && !loading && (
        <div className="space-y-6">
          {/* Spanish Text */}
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-800">Generated Spanish Content</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-gray-700 leading-relaxed text-lg">{response.text}</p>
            </Card.Body>
          </Card>

          {/* Verb Analysis */}
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Verb Analysis</h2>
                <span className="ml-auto text-sm text-gray-500">{response.verbs.length} verbs</span>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Spanish Verb</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">English</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Conjugation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {response.verbs.map((verb, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-primary-600">{verb.spanish}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{verb.english}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{verb.conjugation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>

          {/* Adjective Analysis */}
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-600" />
                <h2 className="text-lg font-semibold text-gray-800">Adjective Analysis</h2>
                <span className="ml-auto text-sm text-gray-500">{response.adjectives.length} adjectives</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {response.adjectives.map((adj, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-primary-600">{adj.spanish}</span>
                    <span className="text-gray-600">{adj.english}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Create Quiz Button */}
          {!quiz && !loadingQuiz && (
            <Button
              onClick={handleCreateQuiz}
              fullWidth
              size="lg"
              leftIcon={<HelpCircle className="w-5 h-5" />}
              className="bg-success-500 hover:bg-success-600"
            >
              Create Comprehension Quiz
            </Button>
          )}

          {/* Loading Quiz */}
          {loadingQuiz && (
            <Card>
              <Card.Body className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Spinner size="lg" />
                  <p className="text-gray-500">Creating quiz questions...</p>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Quiz Section */}
          {quiz && !loadingQuiz && (
            <div className="space-y-6">
              {/* Quiz Header */}
              <Card className="bg-gradient-to-r from-success-500 to-success-600 border-0">
                <Card.Body>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <HelpCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Comprehension Quiz</h2>
                        <p className="text-success-100">
                          {showResults
                            ? `Score: ${getScore().correct}/${getScore().total} (${getScore().percentage}%)`
                            : `${getAnsweredCount()}/${quiz.length} questions answered`
                          }
                        </p>
                      </div>
                    </div>
                    {!showResults && (
                      <Button
                        onClick={handleCheckAnswers}
                        disabled={getAnsweredCount() < quiz.length}
                        className="bg-white text-success-600 hover:bg-gray-100"
                      >
                        Check Answers
                      </Button>
                    )}
                    {showResults && (
                      <Button
                        onClick={handleRetryQuiz}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                        className="bg-white text-success-600 hover:bg-gray-100"
                      >
                        Retry Quiz
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Progress Bar */}
              {!showResults && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{getAnsweredCount()} of {quiz.length} answered</span>
                  </div>
                  <ProgressBar
                    value={getAnsweredCount()}
                    max={quiz.length}
                    color="success"
                  />
                </div>
              )}

              {/* Score Summary */}
              {showResults && (
                <Card className={getScore().percentage >= 80 ? 'bg-success-50 border-success-200' : getScore().percentage >= 60 ? 'bg-warning-50 border-warning-200' : 'bg-error-50 border-error-200'}>
                  <Card.Body>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${getScore().percentage >= 80 ? 'bg-success-100' : getScore().percentage >= 60 ? 'bg-warning-100' : 'bg-error-100'}`}>
                          <Award className={`w-8 h-8 ${getScore().percentage >= 80 ? 'text-success-600' : getScore().percentage >= 60 ? 'text-warning-600' : 'text-error-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {getScore().percentage >= 80 ? 'Excellent!' : getScore().percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                          </h3>
                          <p className="text-gray-600">
                            You got {getScore().correct} out of {getScore().total} questions correct ({getScore().percentage}%)
                          </p>
                        </div>
                      </div>
                      {xpEarned > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-accent-100 rounded-full animate-bounce" style={{ animationDuration: '2s' }}>
                          <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                          <span className="font-bold text-accent-700">+{xpEarned} XP</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Questions */}
              <div className="space-y-4">
                {quiz.map((question, qIndex) => {
                  const isAnswered = selectedAnswers[qIndex] !== undefined;
                  const isCorrect = showResults && selectedAnswers[qIndex] === question.correctAnswer;
                  const isWrong = showResults && isAnswered && selectedAnswers[qIndex] !== question.correctAnswer;

                  return (
                    <Card
                      key={qIndex}
                      className={showResults ? (isCorrect ? 'border-success-300 bg-success-50/50' : isWrong ? 'border-error-300 bg-error-50/50' : '') : ''}
                    >
                      <Card.Body>
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${showResults
                              ? (isCorrect ? 'bg-success-100 text-success-600' : isWrong ? 'bg-error-100 text-error-600' : 'bg-gray-100 text-gray-600')
                              : (isAnswered ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600')
                            }
                          `}>
                            {showResults ? (isCorrect ? <CheckCircle className="w-5 h-5" /> : isWrong ? <XCircle className="w-5 h-5" /> : qIndex + 1) : qIndex + 1}
                          </div>
                          <p className="font-medium text-gray-800 pt-1">{question.question}</p>
                        </div>

                        <div className="space-y-2 ml-11">
                          {question.options.map((option, oIndex) => {
                            const isSelected = selectedAnswers[qIndex] === option;
                            const isCorrectOption = showResults && option === question.correctAnswer;
                            const isWrongSelection = showResults && isSelected && option !== question.correctAnswer;

                            return (
                              <label
                                key={oIndex}
                                className={`
                                  flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                                  ${showResults
                                    ? (isCorrectOption
                                        ? 'border-success-500 bg-success-50'
                                        : isWrongSelection
                                          ? 'border-error-500 bg-error-50'
                                          : 'border-gray-200 bg-white')
                                    : (isSelected
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')
                                  }
                                  ${showResults ? 'cursor-default' : ''}
                                `}
                              >
                                <input
                                  type="radio"
                                  name={`question-${qIndex}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => handleAnswerSelect(qIndex, option)}
                                  disabled={showResults}
                                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                />
                                <span className={`flex-1 ${isCorrectOption ? 'font-medium text-success-700' : isWrongSelection ? 'text-error-700' : 'text-gray-700'}`}>
                                  {String.fromCharCode(65 + oIndex)}) {option}
                                </span>
                                {showResults && isCorrectOption && (
                                  <CheckCircle className="w-5 h-5 text-success-500" />
                                )}
                                {showResults && isWrongSelection && (
                                  <XCircle className="w-5 h-5 text-error-500" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownloadDocx}
                fullWidth
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Study Material as DOCX
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tips Card */}
      {!response && !loading && (
        <Card className="bg-gray-50 border-gray-200">
          <Card.Body>
            <h3 className="font-semibold text-gray-800 mb-3">Topic Ideas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Costa Rican rainforests',
                'Mexican cuisine history',
                'Spanish soccer league',
                'Latin American music',
                'Machu Picchu history',
                'Day of the Dead traditions'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setTopic(suggestion)}
                  className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm text-gray-600 hover:text-primary-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Achievement Modal */}
      <AchievementModal
        achievement={currentAchievement}
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </div>
  );
}

export default Saas1;
