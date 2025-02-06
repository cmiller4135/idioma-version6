import React, { useState } from 'react';
import axios from 'axios';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

const Sub1 = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const prompt = `Translate the word "${query}" into its infinitive Spanish verb, provide the English translation, complete conjugation including tense, mood, and person, and 10 example sentences in Spanish with English translations. The sentences should use a variety of tense, mood, and person but should not use the infinitive version of the Spanish verb.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      }, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data.choices[0].message.content;
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946]">
      <h3>Spanish Verb Translator and Conjugator</h3>
      <h1>Type any form of a Spanish or English verb and get the conjugation and 10 example sentences</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a Spanish or English verb..."
          className="mt-4 p-2 border border-gray-300 rounded w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-custom-blue text-white py-3 px-6 rounded-lg hover:bg-custom-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? 'Generating...' : 'Submit'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-custom-blue mb-4">Generated Content</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              Your answer will be here in seconds...
            </div>
          </div>
        </div>
      ) : (
        response && (
          <div className="mt-8 space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-custom-blue mb-4">Generated Content</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                <pre>{response}</pre>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Sub1;