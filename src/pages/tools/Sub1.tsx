import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Send, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { callOpenAI } from '../../lib/edgeFunctions';
import { extractOpenAIContent } from '../../lib/validation';
import { createLogger } from '../../lib/errorLogger';
import { Card, Button, Input, Spinner } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';

const logger = createLogger('VerbConjugator');

interface ConjugationData {
  infinitive: string;
  translation: string;
  rawContent: string;
}

const Sub1: React.FC = () => {
  const { t } = useTranslation('tools');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conjugation, setConjugation] = useState<ConjugationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['conjugation', 'examples']));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError(t('verbConjugator.error'));
      return;
    }

    setLoading(true);
    setError(null);
    setConjugation(null);

    const prompt = `Translate the word "${query}" into its infinitive Spanish verb, provide the English translation, complete conjugation including tense, mood, and person, and 10 example sentences in Spanish with English translations. The sentences should use a variety of tense, mood, and person but should not use the infinitive version of the Spanish verb.

Format your response like this:
INFINITIVE: [Spanish infinitive verb]
TRANSLATION: [English translation]

CONJUGATION:
[Present Indicative]
yo: [conjugation]
tú: [conjugation]
él/ella/usted: [conjugation]
nosotros: [conjugation]
vosotros: [conjugation]
ellos/ellas/ustedes: [conjugation]

[Preterite]
...continue with other tenses...

EXAMPLES:
1. [Spanish sentence]
   [English translation]
2. ...continue with 10 examples...`;

    try {
      const response = await callOpenAI({
        type: 'chat',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Spanish language assistant specializing in verb conjugations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      });

      const content = extractOpenAIContent(response);

      // Parse the response
      const infinitiveMatch = content.match(/INFINITIVE:\s*(.+)/i);
      const translationMatch = content.match(/TRANSLATION:\s*(.+)/i);

      setConjugation({
        infinitive: infinitiveMatch ? infinitiveMatch[1].trim() : query,
        translation: translationMatch ? translationMatch[1].trim() : '',
        rawContent: content
      });
    } catch (error) {
      logger.error(error, 'conjugateVerb', { query });
      setError(error instanceof Error ? error.message : t('verbConjugator.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (conjugation?.rawContent) {
      await navigator.clipboard.writeText(conjugation.rawContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const parseConjugationSection = (content: string): string => {
    const conjugationMatch = content.match(/CONJUGATION:([\s\S]*?)(?=EXAMPLES:|$)/i);
    return conjugationMatch ? conjugationMatch[1].trim() : '';
  };

  const parseExamplesSection = (content: string): string[] => {
    const examplesMatch = content.match(/EXAMPLES:([\s\S]*?)$/i);
    if (!examplesMatch) return [];

    const examplesText = examplesMatch[1].trim();
    // Split by numbered items
    const examples = examplesText.split(/\n\d+\.\s+/).filter(e => e.trim());
    return examples;
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Languages className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('verbConjugator.title')}</h1>
        </div>
        <p className="text-gray-600 ml-14">
          {t('verbConjugator.subtitle')}
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('verbConjugator.enterVerb')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('verbConjugator.placeholder')}
              error={error && !loading ? error : undefined}
              leftIcon={<Languages className="w-5 h-5" />}
            />
            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              rightIcon={<Send className="w-4 h-4" />}
            >
              {loading ? t('verbConjugator.conjugating') : t('verbConjugator.conjugate')}
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
              <p className="text-gray-500">{t('verbConjugator.generatingConjugations')}</p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Results */}
      {conjugation && !loading && (
        <div className="space-y-4">
          {/* Verb Header Card */}
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 border-0">
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{conjugation.infinitive}</h2>
                  <p className="text-primary-100 text-lg">{conjugation.translation}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleCopy}
                  className="text-white hover:bg-white/10"
                  leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? t('verbConjugator.copied') : t('verbConjugator.copyAll')}
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Conjugation Section */}
          <Card>
            <button
              onClick={() => toggleSection('conjugation')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">{t('verbConjugator.conjugationTables')}</h3>
              {expandedSections.has('conjugation') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.has('conjugation') && (
              <Card.Body className="pt-0 border-t border-gray-100">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-700 overflow-x-auto">
                    {parseConjugationSection(conjugation.rawContent)}
                  </pre>
                </div>
              </Card.Body>
            )}
          </Card>

          {/* Examples Section */}
          <Card>
            <button
              onClick={() => toggleSection('examples')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">{t('verbConjugator.exampleSentences')}</h3>
              {expandedSections.has('examples') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.has('examples') && (
              <Card.Body className="pt-0 border-t border-gray-100">
                <div className="space-y-4">
                  {parseExamplesSection(conjugation.rawContent).map((example, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-1">
                          {example.split('\n').map((line, lineIndex) => (
                            <p
                              key={lineIndex}
                              className={lineIndex === 0 ? 'font-medium text-gray-800' : 'text-gray-600 text-sm'}
                            >
                              {line.trim()}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            )}
          </Card>

          {/* Full Response (Collapsible) */}
          <Card>
            <button
              onClick={() => toggleSection('full')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">{t('verbConjugator.fullResponse')}</h3>
              {expandedSections.has('full') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.has('full') && (
              <Card.Body className="pt-0 border-t border-gray-100">
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto">
                  {conjugation.rawContent}
                </pre>
              </Card.Body>
            )}
          </Card>
        </div>
      )}

      {/* Tips Card */}
      {!conjugation && !loading && (
        <Card className="bg-gray-50 border-gray-200">
          <Card.Body>
            <h3 className="font-semibold text-gray-800 mb-3">{t('verbConjugator.tipsTitle')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>{t('verbConjugator.tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>{t('verbConjugator.tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>{t('verbConjugator.tip3')}</span>
              </li>
            </ul>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Sub1;
