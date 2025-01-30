import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import axios from 'axios';

interface GrokResponse {
  text: string;
  verbs: Array<{
    language: string;
    english: string;
    conjugation: string;
  }>;
  adjectives: Array<{
    language: string;
    english: string;
  }>;
}

const languages = ["Spanish", "French", "German", "Chinese", "Japanese"];

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

function Saas2() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GrokResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [language, setLanguage] = useState<string>(languages[0]);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [feedback, setFeedback] = useState<{ [key: number]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const prompt = `Please provide a response in the following format:

1. First, write a response of: ${topic} in ${language} and then provide the English translation.

2. Then, write "VERBS:" on a new line, followed by a list of all ${language} verbs used in the summary. Format each verb on a new line like this:
[${language} verb] - [English translation] - [conjugation description]

3. Then, write "ADJECTIVES:" on a new line, followed by a list of all ${language} adjectives used in the summary. Format each adjective on a new line like this:
[${language} adjective] - [English translation]

Make sure to include ALL verbs and adjectives used in the summary, and ensure proper formatting with the dash separators.

4. Finally, provide the translation in a table format with the foreign language translation in the left-hand column and the English translation in the right-hand column.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [{ role: "system", content: prompt }],
          max_tokens: 3000,
          temperature: 0.4
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      // Access the usage object from the response
      const usage = data.usage;

      // Log the token usage details
      console.log(`Prompt tokens used: ${usage.prompt_tokens}`);
      console.log(`Completion tokens used: ${usage.completion_tokens}`);
      console.log(`Total tokens used: ${usage.total_tokens}`);
      console.log('Json string' + JSON.stringify(data.usage));
      //console.log('Json string' + JSON.stringify(data.choices[0].message.content));

      const content = data.choices[0].message.content;
      
      // Split the content into sections using the markers
      const textSection = content.split('VERBS:')[0].trim();
      const verbSection = content.split('VERBS:')[1]?.split('ADJECTIVES:')[0].trim() || '';
      const adjectiveSection = content.split('ADJECTIVES:')[1]?.trim() || '';
      
      // Parse verbs with error handling
      const verbs = verbSection.split('\n')
        .filter(line => line.trim() && line.includes('-'))
        .map(line => {
          const parts = line.split('-').map(part => part.trim());
          return {
            language: parts[0] || '',
            english: parts[1] || '',
            conjugation: parts[2] || ''
          };
        });

      // Parse adjectives with error handling
      const adjectives = adjectiveSection.split('\n')
        .filter(line => line.trim() && line.includes('-'))
        .map(line => {
          const parts = line.split('-').map(part => part.trim());
          return {
            language: parts[0] || '',
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

    const quizPrompt = `Create a 3-question multiple choice quiz to test comprehension of the following paragraph:
    
${response.text}

Format each question as follows:
Question: [question]
Options:
1. [option 1]
2. [option 2]
3. [option 3]
4. [option 4]
Correct Answer: [correct answer]`;

    try {
      const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: quizPrompt }],
          max_tokens: 1000,
          temperature: 0.4
        })
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.json().catch(() => null);
        throw new Error(errorData?.error?.message || `API request failed with status ${quizResponse.status}`);
      }

      const quizData = await quizResponse.json();
      
      if (!quizData?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const quizContent = quizData.choices[0].message.content;
      const quizQuestions = quizContent.split('\n\n').map((questionBlock: string) => {
        const [questionLine, ...optionsLines] = questionBlock.split('\n');
        const question = questionLine.replace('Question: ', '').trim();
        const options = optionsLines.slice(1, 5).map(line => line.replace(/^\d+\.\s*/, '').trim());
        const correctAnswer = optionsLines[5].replace('Correct Answer: ', '').trim();
        return { question, options, correctAnswer };
      });

      setQuiz(quizQuestions);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleAnswerSelect = (questionIndex: number, selectedOption: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
    const isCorrect = quiz![questionIndex].correctAnswer === selectedOption;
    setFeedback(prev => ({
      ...prev,
      [questionIndex]: isCorrect ? 'Correct' : `Incorrect. The correct answer is: ${quiz![questionIndex].correctAnswer}`
    }));
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
                  text: "Translated and English Content",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              text: response.text,
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Verb Analysis",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            ...response.verbs.map(verb => new Paragraph({
              text: `${verb.language} - ${verb.english} - ${verb.conjugation}`,
            })),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Adjective Analysis",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            ...response.adjectives.map(adj => new Paragraph({
              text: `${adj.language} - ${adj.english}`,
            })),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Quiz",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            ...quiz.map(question => new Paragraph({
              children: [
                new TextRun({
                  text: `Question: ${question.question}`,
                  bold: true,
                  size: 28,
                }),
                ...question.options.map((option, idx) => new Paragraph({
                  text: `${idx + 1}. ${option}`,
                })),
                new Paragraph({
                  text: `Correct Answer: ${question.correctAnswer}`,
                  spacing: {
                    after: 200,
                  },
                }),
              ],
            })),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "response_and_quiz.docx");
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-custom-red">
      <h1 className="text-xl font-bold text-custom-blue mb-8">This webpage uses Open AI to create text in a language you choose. Simply enter a topic in the textbox below and study the text, verbs, and adjectives (examples - ask about current events, ask for a fictional story, or ask for example sentences on a particular verb or grammar subject.)</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic"
          className="mt-4 p-2 border border-gray-300 rounded w-full"
        />
        <h1 className="text-xl font-bold text-custom-blue mb-8">Choose a language</h1>
      
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-4 p-2 border border-gray-300 rounded w-full"
        >
          {languages.map((lang, index) => (
            <option key={index} value={lang}>{lang}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-custom-blue text-white py-3 px-6 rounded-lg hover:bg-custom-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            'Generating...'
          ) : (
            <>
              Generate Summary <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-8 space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-custom-blue mb-4">Generated Content</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-700 leading-relaxed">
                {response.text.split('\n\n')[0]}
              </div>
              <div className="text-gray-700 leading-relaxed">
                {response.text.split('\n\n')[1]}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-custom-blue mb-4">Verb Analysis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{language} Verb</th>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">English Translation</th>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conjugation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {response.verbs.map((verb, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{verb.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{verb.english}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{verb.conjugation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-custom-blue mb-4">Adjective Analysis</h2>
            <div className="grid grid-cols-2 gap-4">
              {response.adjectives.map((adj, index) => (
                <div key={index} className="flex justify-between p-3 bg-white rounded shadow-sm">
                  <span className="font-medium text-custom-blue">{adj.language}</span>
                  <span className="text-gray-600">{adj.english}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateQuiz}
            className="w-full bg-custom-blue text-white py-3 px-6 rounded-lg hover:bg-custom-red transition-colors flex items-center justify-center gap-2"
          >
            Create Quiz
          </button>

          {quiz && (
            <div className="mt-8 space-y-8">
              <h2 className="text-xl font-semibold text-custom-blue mb-4">Quiz</h2>
              {quiz.map((question, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">{question.question}</p>
                  <ul className="space-y-2">
                    {question.options.map((option, idx) => (
                      <li key={idx} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          id={`question-${index}-option-${idx}`}
                          className="mr-2"
                          onChange={() => handleAnswerSelect(index, option)}
                        />
                        <label htmlFor={`question-${index}-option-${idx}`} className="text-gray-700">{option}</label>
                      </li>
                    ))}
                  </ul>
                  {feedback[index] && (
                    <p className={`mt-2 ${feedback[index].startsWith('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                      {feedback[index]}
                    </p>
                  )}
                </div>
              ))}
              <button
                onClick={handleDownloadDocx}
                className="w-full bg-custom-blue text-white py-3 px-6 rounded-lg hover:bg-custom-red transition-colors flex items-center justify-center gap-2"
              >
                Download as DOCX
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Saas2;