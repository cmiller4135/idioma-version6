import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import axios from 'axios';

interface VocabularyWord {
  vocab_id: string;
  word: string;
  word_translated: string;
  list_name: string;
  language: string;
}

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
const deeplApiKey = import.meta.env.VITE_DEEPL_API_KEY;

const Sub2 = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [listNames, setListNames] = useState<string[]>([]);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingTranslationId, setEditingTranslationId] = useState<string | null>(null);
  const [newWord, setNewWord] = useState<string>('');
  const [newTranslation, setNewTranslation] = useState<string>('');
  const [addingWord, setAddingWord] = useState<boolean>(false);
  const [newWordListName, setNewWordListName] = useState<string | null>(null);
  const [creatingNewList, setCreatingNewList] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');
  const [exampleSentences, setExampleSentences] = useState<{ [key: string]: string[] }>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [otherLanguage, setOtherLanguage] = useState<string>('');

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
        .select('vocab_id, word, word_translated, list_name, language')
        .eq('user_id', userId)
        .eq('list_name', listName);

      if (error) throw error;
      if (Array.isArray(data)) {
        setVocabulary(data);
      } else {
        setVocabulary([]);
      }
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

  const handleListClick = async (listName: string) => {
    setSelectedListName(listName);
    setLoading(true);
    await fetchVocabulary(listName);
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

  const handleAddWord = async () => {
    if (creatingNewList && !newListName.trim()) {
      alert('Please enter a vocabulary list name');
      return;
    }

    if (creatingNewList && selectedLanguage === '') {
      alert('Please select a language');
      return;
    }

    if (selectedLanguage === 'Other' && !otherLanguage.trim()) {
      alert('Please enter a language');
      return;
    }

    if (!newWord.trim()) {
      alert('Please enter a word');
      return;
    }

    if (!newTranslation.trim()) {
      alert('Please enter a translation');
      return;
    }

    try {
      const listNameToUse = creatingNewList ? newListName : newWordListName;
      const languageToUse = selectedLanguage === 'Other' ? otherLanguage : selectedLanguage;
      const { data, error } = await supabase
        .from('vocabulary')
        .insert([{ user_id: userId, list_name: listNameToUse, word: newWord, word_translated: newTranslation, language: languageToUse }]);

      if (error) throw error;
      if (Array.isArray(data)) {
        setVocabulary(prev => [...prev, ...data]);
      }
      setNewWord('');
      setNewTranslation('');
      setAddingWord(false);
      setCreatingNewList(false);
      setNewWordListName(listNameToUse); // Ensure the dropdown shows the correct value
      setNewListName('');
      setSelectedLanguage('');
      setOtherLanguage('');
      await fetchListNames(); // Reload the list names
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewWordListNameChange = (value: string) => {
    if (value === 'new') {
      setCreatingNewList(true);
      setNewWordListName('new');
    } else {
      setCreatingNewList(false);
      setNewWordListName(value);
    }
  };

  const handleGetTranslation = async () => {
    try {
      const response = await fetch('https://api.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          auth_key: deeplApiKey,
          text: newWord,
          target_lang: 'ES',
        }),
      });

      const data = await response.json();
      if (data.translations && data.translations.length > 0) {
        setNewTranslation(data.translations[0].text);
      } else {
        setError('No translation found');
      }
    } catch (err) {
      setError('Error fetching translation');
    }
  };

  const fetchExampleSentences = async () => {
    if (!selectedListName) return;

    const sentences: { [key: string]: string[] } = {};
    for (const word of vocabulary) {
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
              content: `Provide two example ${word.language} sentences for the word "${word.word_translated}" with English translations.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.4
        }, {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const data = response.data.choices[0].message.content;
        sentences[word.word_translated] = data.split('\n').filter(sentence => sentence.trim() !== '');
      } catch (error) {
        console.error('Error fetching example sentences:', error);
      }
    }
    setExampleSentences(sentences);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-[#E63946]">Error: {error}</div>;

  return (
    <div className="flex flex-col">
      <div className="flex">
        <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946] w-1/2 h-full">
          <h2 className="text-xl font-semibold text-custom-blue">My Vocabulary Lists</h2>
          <p className="text-custom-blue text-sm mb-2">(click 'Add a Word' to manage lists and words)</p>
          <div className="flex flex-wrap gap-2">
            {listNames.map((listName, index) => (
              <button
                key={index}
                onClick={() => handleListClick(listName)}
                className={`w-[35%] py-2 px-4 rounded-lg transition-colors ${selectedListName === listName ? 'bg-custom-red text-white' : 'bg-custom-blue text-white hover:bg-custom-red'}`}
              >
                {listName}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946] w-1/2">
          <h1 className="text-xl font-semibold text-custom-blue mb-4"> My {selectedListName} Vocabulary Words</h1>
          <button
            onClick={() => setAddingWord(true)}
            className="mb-4 bg-custom-blue text-white py-2 px-4 rounded-lg hover:bg-custom-red transition-colors"
          >
            Add a Word
          </button>
          {addingWord && (
            <div className="mb-4">
              <select
                value={newWordListName || ''}
                onChange={(e) => handleNewWordListNameChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2"
              >
                <option value="" disabled>Select a vocabulary list</option>
                <option value="new">Create a New List</option>
                {listNames.map((listName, index) => (
                  <option key={index} value={listName}>{listName}</option>
                ))}
              </select>
              {creatingNewList && (
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter new list name"
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
              )}
              {creatingNewList && (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2"
              >
                <option value="" disabled>Select a Language</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Other">Other</option>
              </select>
              )}
              {selectedLanguage === 'Other' && (
                <input
                  type="text"
                  value={otherLanguage}
                  onChange={(e) => setOtherLanguage(e.target.value)}
                  placeholder="Enter other language"
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
              )}
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Word"
                  className="w-3/4 p-2 border border-gray-300 rounded"
                />
                <button
                  onClick={handleGetTranslation}
                  className="ml-2 w-1/4 bg-custom-blue text-white py-2 px-4 rounded-lg hover:bg-custom-red transition-colors hidden"
                >
                  Translate
                </button>
              </div>
              <input
                type="text"
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.target.value)}
                placeholder="Translation"
                className="w-full p-2 border border-gray-300 rounded mb-2"
              />
              <button
                onClick={handleAddWord}
                className="w-full bg-custom-blue text-white py-2 px-4 rounded-lg hover:bg-custom-red transition-colors"
              >
                Save Word
              </button>
            </div>
          )}
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
      <div className="mt-4 text-xl font-semibold text-custom-blue">
        Hello World
      </div>
      <button
        onClick={fetchExampleSentences}
        className="mt-4 bg-custom-blue text-white py-2 px-4 rounded-lg hover:bg-custom-red transition-colors"
      >
        Get example sentences
      </button>
      <div className="mt-4">
        {Object.entries(exampleSentences).map(([word, sentences]) => (
          <div key={word} className="mb-4">
            <h3 className="text-lg font-semibold text-custom-blue mb-2">{word}</h3>
            <ul className="list-disc list-inside">
              {sentences.map((sentence, index) => (
                <li key={index} className="text-gray-700">{sentence}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sub2;