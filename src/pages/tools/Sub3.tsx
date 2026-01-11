import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Stethoscope,
  Briefcase,
  Hotel,
  Laptop,
  HardHat,
  GraduationCap,
  Scale,
  Wheat,
  Palette,
  ChefHat,
  MoreHorizontal,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { callOpenAI } from '../../lib/edgeFunctions';
import { extractOpenAIContent } from '../../lib/validation';
import { createLogger } from '../../lib/errorLogger';
import { Card, Button, Input, Spinner } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';

const logger = createLogger('TopicVocabulary');

interface TopicOption {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const topicsConfig: TopicOption[] = [
  { id: 'Medicine/Healthcare', labelKey: 'healthcare', icon: <Stethoscope className="w-6 h-6" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  { id: 'Business/Finance', labelKey: 'business', icon: <Briefcase className="w-6 h-6" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'Hospitality/Tourism', labelKey: 'hospitality', icon: <Hotel className="w-6 h-6" />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'Technology/IT', labelKey: 'technology', icon: <Laptop className="w-6 h-6" />, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { id: 'Construction/Engineering', labelKey: 'construction', icon: <HardHat className="w-6 h-6" />, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'Education/Teaching', labelKey: 'education', icon: <GraduationCap className="w-6 h-6" />, color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'Law/Legal', labelKey: 'legal', icon: <Scale className="w-6 h-6" />, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { id: 'Agriculture/Farming', labelKey: 'agriculture', icon: <Wheat className="w-6 h-6" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'Arts/Entertainment', labelKey: 'arts', icon: <Palette className="w-6 h-6" />, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { id: 'Culinary/Gastronomy', labelKey: 'culinary', icon: <ChefHat className="w-6 h-6" />, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'custom', labelKey: 'customTopic', icon: <MoreHorizontal className="w-6 h-6" />, color: 'text-primary-600', bgColor: 'bg-primary-100' },
];

interface VocabWord {
  spanish: string;
  english: string;
  examples: string[];
}

const Sub3: React.FC = () => {
  const { t } = useTranslation('tools');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setWords([]);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedTopic) {
      setError(t('topicVocabulary.errorSelectTopic'));
      return;
    }

    if (selectedTopic === 'custom' && !customTopic.trim()) {
      setError(t('topicVocabulary.errorEnterCustom'));
      return;
    }

    const topic = selectedTopic === 'custom' ? customTopic : selectedTopic;

    setLoading(true);
    setError(null);
    setWords([]);

    const prompt = `Please provide a list of 10 Spanish words related to ${topic} along with their English translations. After each word, provide 2 example sentences using the word.

Format your response EXACTLY like this (use this exact format for parsing):
WORD: [Spanish word]
TRANSLATION: [English translation]
EXAMPLE1: [Spanish sentence] | [English translation]
EXAMPLE2: [Spanish sentence] | [English translation]
---
WORD: [next word]
...and so on for all 10 words`;

    try {
      const data = await callOpenAI({
        type: 'chat',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Spanish language assistant. Always follow the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      });

      const content = extractOpenAIContent(data);

      // Parse the response
      const wordBlocks = content.split('---').filter((block: string) => block.trim());
      const parsedWords: VocabWord[] = [];

      for (const block of wordBlocks) {
        const wordMatch = block.match(/WORD:\s*(.+)/i);
        const translationMatch = block.match(/TRANSLATION:\s*(.+)/i);
        const example1Match = block.match(/EXAMPLE1:\s*(.+)/i);
        const example2Match = block.match(/EXAMPLE2:\s*(.+)/i);

        if (wordMatch && translationMatch) {
          parsedWords.push({
            spanish: wordMatch[1].trim(),
            english: translationMatch[1].trim(),
            examples: [
              example1Match ? example1Match[1].trim() : '',
              example2Match ? example2Match[1].trim() : ''
            ].filter(e => e)
          });
        }
      }

      // If parsing failed, try a simpler approach
      if (parsedWords.length === 0) {
        // Fallback: just display the raw content
        setWords([{
          spanish: 'Results',
          english: topic,
          examples: content.split('\n').filter((line: string) => line.trim())
        }]);
      } else {
        setWords(parsedWords);
      }
    } catch (error) {
      logger.error(error, 'generateVocabulary', { topic: selectedTopic });
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWord = async (index: number) => {
    const word = words[index];
    const text = `${word.spanish} - ${word.english}\n${word.examples.join('\n')}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getSelectedTopicInfo = () => {
    return topicsConfig.find(topic => topic.id === selectedTopic);
  };

  const getTopicLabel = (labelKey: string) => {
    return t(`topicVocabulary.topics.${labelKey}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-accent-100 rounded-xl">
            <BookOpen className="w-6 h-6 text-accent-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('topicVocabulary.title')}</h1>
        </div>
        <p className="text-gray-600 ml-14">
          {t('topicVocabulary.subtitle')}
        </p>
      </div>

      {/* Topic Selection Grid */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-800">{t('topicVocabulary.selectTopic')}</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {topicsConfig.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${selectedTopic === topic.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`p-3 rounded-xl ${topic.bgColor}`}>
                  <span className={topic.color}>{topic.icon}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {getTopicLabel(topic.labelKey)}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Topic Input */}
          {selectedTopic === 'custom' && (
            <div className="mt-4">
              <Input
                label={t('topicVocabulary.enterCustomTopic')}
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder={t('topicVocabulary.customPlaceholder')}
                error={error && selectedTopic === 'custom' ? error : undefined}
              />
            </div>
          )}

          {error && selectedTopic !== 'custom' && (
            <p className="mt-4 text-sm text-error-500">{error}</p>
          )}

          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              fullWidth
              disabled={!selectedTopic}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {loading ? t('topicVocabulary.generating') : t('topicVocabulary.generate')}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <Card.Body className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p className="text-gray-500">
                {t('topicVocabulary.generatingFor', { topic: selectedTopic === 'custom' ? customTopic : getTopicLabel(getSelectedTopicInfo()?.labelKey || '') })}
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Results */}
      {words.length > 0 && !loading && (
        <div className="space-y-4">
          {/* Results Header */}
          <Card className="bg-gradient-to-r from-accent-500 to-accent-600 border-0">
            <Card.Body>
              <div className="flex items-center gap-4">
                {getSelectedTopicInfo() && (
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <span className="text-white">{getSelectedTopicInfo()?.icon}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedTopic === 'custom' ? customTopic : getTopicLabel(getSelectedTopicInfo()?.labelKey || '')} {t('topicVocabulary.vocabulary')}
                  </h2>
                  <p className="text-accent-100">{t('topicVocabulary.wordCount', { count: words.length })}</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Word Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {words.map((word, index) => (
              <Card key={index} hover>
                <Card.Body>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-primary-600">{word.spanish}</h3>
                      <p className="text-gray-600">{word.english}</p>
                    </div>
                    <button
                      onClick={() => handleCopyWord(index)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                      title={t('topicVocabulary.copyWordAndExamples')}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-success-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {word.examples.length > 0 && (
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('topicVocabulary.examples')}</p>
                      {word.examples.map((example, exIndex) => (
                        <p key={exIndex} className="text-sm text-gray-600 pl-3 border-l-2 border-primary-200">
                          {example}
                        </p>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips Card */}
      {!words.length && !loading && (
        <Card className="bg-gray-50 border-gray-200">
          <Card.Body>
            <h3 className="font-semibold text-gray-800 mb-3">{t('topicVocabulary.howToUse')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <span>{t('topicVocabulary.tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <span>{t('topicVocabulary.tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <span>{t('topicVocabulary.tip3')}</span>
              </li>
            </ul>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Sub3;
