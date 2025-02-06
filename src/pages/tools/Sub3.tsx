import React, { useState } from 'react';
import axios from 'axios';

const subjects = [
  "Medicine/Healthcare",
  "Other - You choose the topic",
  "Business/Finance",
  "Hospitality/Tourism",
  "Technology/IT",
  "Construction/Engineering",
  "Education/Teaching",
  "Law/Legal",
  "Agriculture/Farming",
  "Arts/Entertainment",
  "Culinary/Gastronomy"
  
];

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

const Sub3 = () => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const topic = selectedSubject === "Other - You choose the topic" ? customTopic : selectedSubject;
    const prompt = `Please provide a list of 10 Spanish words related to ${topic} along with their English translations. After each word, provide 2 example sentences using the word.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-custom-red">
      <h1 className="text-xl font-bold text-custom-blue mb-8">Retrieve Spanish Words Related to a Subject</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="mt-4 p-2 border border-gray-300 rounded w-full"
        >
          {subjects.map((subject, index) => (
            <option key={index} value={subject}>{subject}</option>
          ))}
        </select>
        {selectedSubject === "Other - You choose the topic" && (
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter your custom topic"
            className="mt-4 p-2 border border-gray-300 rounded w-full"
          />
        )}
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
                {response}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Sub3;