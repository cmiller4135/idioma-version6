import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface VocabularyWord {
  vocab_id: string;
  word: string;
  word_translated: string;
  list_name: string;
}

const Sub2 = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [listNames, setListNames] = useState<string[]>([]);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingTranslationId, setEditingTranslationId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchListNames();
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserId(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVocabulary = async (listName: string) => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('vocab_id, word, word_translated, list_name')
        .eq('user_id', userId)
        .eq('list_name', listName);

      if (error) throw error;
      setVocabulary(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchListNames = async () => {
    try {
      const { data, error } = await supabase.rpc('get_distinct_list_names', { user_id: userId });

      if (error) throw error;
      setListNames(data.map((item: { list_name: string }) => item.list_name));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleListClick = async () => {
    if (!selectedListName) return;
    setLoading(true);
    await fetchVocabulary(selectedListName);
    setLoading(false);
  };

  const handleEditWord = (id: string) => {
    setEditingWordId(id);
    setEditingTranslationId(null);
  };

  const handleEditTranslation = (id: string) => {
    setEditingTranslationId(id);
    setEditingWordId(null);
  };

  const handleSaveWord = async (id: string, newWord: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({ word: newWord })
        .eq('vocab_id', id);

      if (error) throw error;
      setVocabulary(prev => prev.map(word => word.vocab_id === id ? { ...word, word: newWord } : word));
      setEditingWordId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveTranslation = async (id: string, newTranslation: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({ word_translated: newTranslation })
        .eq('vocab_id', id);

      if (error) throw error;
      setVocabulary(prev => prev.map(word => word.vocab_id === id ? { ...word, word_translated: newTranslation } : word));
      setEditingTranslationId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-[#E63946]">Error: {error}</div>;

  return (
    <div className="flex">
      <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946] w-1/2 h-full">
        <h2 className="text-xl font-semibold text-custom-blue mb-4">My Vocabulary Lists</h2>
        <select
          value={selectedListName || ''}
          onChange={(e) => setSelectedListName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="" disabled>Select a vocabulary list</option>
          {listNames.map((listName, index) => (
            <option key={index} value={listName}>{listName}</option>
          ))}
        </select>
        <button
          onClick={handleListClick}
          className="w-full bg-custom-blue text-white py-3 px-6 rounded-lg hover:bg-custom-red transition-colors"
        >
          Select List
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946] w-1/2">
        <div className="text-left text-sm text-gray-700 mb-4">User ID: {userId}</div>
        <h1 className="text-xl font-semibold text-custom-blue mb-4">{selectedListName} Vocabulary</h1>
        <ul className="space-y-4">
          {vocabulary.map((word) => (
            <li key={word.vocab_id} className="flex justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg" style={{ height: '62.5%' }}>
              {editingWordId === word.vocab_id ? (
                <input
                  type="text"
                  value={word.word}
                  onChange={(e) => handleSaveWord(word.vocab_id, e.target.value)}
                  className="border border-gray-300 rounded p-2"
                />
              ) : (
                <span className="font-medium text-custom-blue" onClick={() => handleEditWord(word.vocab_id)}>
                  {word.word}
                </span>
              )}
              {editingTranslationId === word.vocab_id ? (
                <input
                  type="text"
                  value={word.word_translated}
                  onChange={(e) => handleSaveTranslation(word.vocab_id, e.target.value)}
                  className="border border-gray-300 rounded p-2"
                />
              ) : (
                <span className="text-gray-700" onClick={() => handleEditTranslation(word.vocab_id)}>
                  {word.word_translated}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sub2;