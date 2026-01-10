import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Languages,
  Trash2,
  Edit3,
  Save,
  X,
  FileText,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { callOpenAI, translateWithDeepL } from '../../lib/edgeFunctions';
import { Chat } from './Chat';
import { Card, Button, Input, Select, Spinner, Modal } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';

interface VocabularyWord {
  vocab_id: string;
  word: string;
  word_translated: string;
  list_name: string;
  language: string;
}

const languageOptions = [
  { value: '', label: 'Select a Language' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Other', label: 'Other' },
];

const sentenceCountOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} sentence${i > 0 ? 's' : ''}`
}));

const Sub2: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [listNames, setListNames] = useState<string[]>([]);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWord, setNewWord] = useState<string>('');
  const [newTranslation, setNewTranslation] = useState<string>('');
  const [addingWord, setAddingWord] = useState<boolean>(false);
  const [newWordListName, setNewWordListName] = useState<string | null>(null);
  const [creatingNewList, setCreatingNewList] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');
  const [exampleSentences, setExampleSentences] = useState<{ [key: string]: string[] }>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [otherLanguage, setOtherLanguage] = useState<string>('');
  const [renamingListName, setRenamingListName] = useState<string | null>(null);
  const [newListNameInput, setNewListNameInput] = useState<string>('');
  const [renamingWordId, setRenamingWordId] = useState<string | null>(null);
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [newTranslationInput, setNewTranslationInput] = useState<string>('');
  const [loadingExamples, setLoadingExamples] = useState<boolean>(false);
  const [numSentences, setNumSentences] = useState<number>(3);
  const [translating, setTranslating] = useState<boolean>(false);

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'list' | 'word';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'list', id: '', name: '' });

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchListNames = async () => {
    try {
      const { data, error } = await supabase.rpc('get_distinct_list_names', { user_id: userId });

      if (error) throw error;
      setListNames(data.map((item: { list_name: string }) => item.list_name));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleListClick = async (listName: string) => {
    setSelectedListName(listName);
    setLoading(true);
    setAddingWord(false);
    setExampleSentences({});
    await fetchVocabulary(listName);
    setLoading(false);
  };

  const handleSaveWord = async (id: string, newWord: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({ word: newWord })
        .eq('vocab_id', id);

      if (error) throw error;
      setVocabulary(prev => prev.map(word => word.vocab_id === id ? { ...word, word: newWord } : word));
      if (selectedListName) {
        await fetchVocabulary(selectedListName);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddWord = async () => {
    if (creatingNewList && !newListName.trim()) {
      setError('Please enter a vocabulary list name');
      return;
    }

    if (creatingNewList && selectedLanguage === '') {
      setError('Please select a language');
      return;
    }

    if (selectedLanguage === 'Other' && !otherLanguage.trim()) {
      setError('Please enter a language');
      return;
    }

    if (!newWord.trim()) {
      setError('Please enter a word');
      return;
    }

    if (!newTranslation.trim()) {
      setError('Please enter a translation');
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
      setNewWordListName(listNameToUse);
      setNewListName('');
      setSelectedLanguage('');
      setOtherLanguage('');
      setError(null);
      await fetchListNames();
      if (selectedListName) {
        await fetchVocabulary(selectedListName);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    if (!newWord.trim()) {
      setError('Please enter a word to translate');
      return;
    }
    setTranslating(true);
    try {
      const data = await translateWithDeepL(newWord, 'ES');
      if (data.translations && data.translations.length > 0) {
        setNewTranslation(data.translations[0].text);
        setError(null);
      } else {
        setError('No translation found');
      }
    } catch (err) {
      setError('Error fetching translation');
    } finally {
      setTranslating(false);
    }
  };

  const fetchExampleSentences = async () => {
    if (!selectedListName) {
      setError('No list is selected. Please click one of your Vocabulary Lists and try again.');
      return;
    }

    if (vocabulary.length === 0) {
      setError('No words in this list. Add some words first.');
      return;
    }

    setLoadingExamples(true);
    setError(null);

    const sentences: { [key: string]: string[] } = {};
    for (const word of vocabulary) {
      try {
        const response = await callOpenAI({
          type: 'chat',
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.'
            },
            {
              role: 'user',
              content: `Provide ${numSentences} example ${word.language} sentences for the word "${word.word_translated}" with English translations.`
            }
          ],
          max_tokens: 3000,
          temperature: 0.4
        });

        const data = response.choices[0].message.content;
        sentences[word.word_translated] = data.split('\n').filter((sentence: string) => sentence.trim() !== '');
      } catch (error) {
        console.error('Error fetching example sentences:', error);
      }
    }
    setExampleSentences(sentences);
    setLoadingExamples(false);
  };

  const confirmDeleteList = (listName: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'list',
      id: listName,
      name: listName
    });
  };

  const confirmDeleteWord = (vocabId: string, wordName: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'word',
      id: vocabId,
      name: wordName
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.type === 'list') {
      await handleDeleteList(deleteModal.id);
    } else {
      await handleDelete(deleteModal.id);
    }
    setDeleteModal({ isOpen: false, type: 'list', id: '', name: '' });
  };

  const handleDeleteList = async (listName: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('user_id', userId)
        .eq('list_name', listName);

      if (error) throw error;
      setListNames(prev => prev.filter(name => name !== listName));
      if (selectedListName === listName) {
        setSelectedListName(null);
        setVocabulary([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRenameList = async (oldListName: string) => {
    setRenamingListName(oldListName);
    setNewListNameInput(oldListName);
  };

  const handleSaveListName = async (oldListName: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({ list_name: newListNameInput })
        .eq('user_id', userId)
        .eq('list_name', oldListName);

      if (error) throw error;
      setListNames(prev => prev.map(name => name === oldListName ? newListNameInput : name));
      if (selectedListName === oldListName) {
        setSelectedListName(newListNameInput);
      }
      setRenamingListName(null);
      setNewListNameInput('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (vocabId: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('vocab_id', vocabId);

      if (error) throw error;
      setVocabulary(prev => prev.filter(word => word.vocab_id !== vocabId));

      await fetchListNames();
      if (selectedListName) {
        await fetchVocabulary(selectedListName);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRename = (vocabId: string) => {
    const wordToRename = vocabulary.find(word => word.vocab_id === vocabId);
    if (wordToRename) {
      setRenamingWordId(vocabId);
      setNewWordInput(wordToRename.word);
      setNewTranslationInput(wordToRename.word_translated);
    }
  };

  const handleSaveRename = async (vocabId: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({ word: newWordInput, word_translated: newTranslationInput })
        .eq('vocab_id', vocabId);

      if (error) throw error;
      setVocabulary(prev => prev.map(word => word.vocab_id === vocabId ? { ...word, word: newWordInput, word_translated: newTranslationInput } : word));
      setRenamingWordId(null);
      setNewWordInput('');
      setNewTranslationInput('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancelRename = () => {
    setRenamingWordId(null);
    setNewWordInput('');
    setNewTranslationInput('');
  };

  const getListOptions = () => {
    const options = [
      { value: '', label: 'Select a vocabulary list' },
      { value: 'new', label: '+ Create a New List' },
      ...listNames.map(name => ({ value: name, label: name }))
    ];
    return options;
  };

  if (loading && !userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-xl">
            <BookOpen className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">My Vocabulary</h1>
        </div>
        <p className="text-gray-600 ml-14">
          Build and manage your personal vocabulary lists.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-error-500 hover:text-error-700">
            <X className="w-4 h-4 inline" />
          </button>
        </div>
      )}

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lists Panel */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-800">My Vocabulary Lists</h2>
              </div>
              <span className="text-sm text-gray-500">{listNames.length} lists</span>
            </div>
          </Card.Header>
          <Card.Body>
            {listNames.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No vocabulary lists yet.</p>
                <p className="text-sm">Click "Add a Word" to create your first list.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {listNames.map((listName, index) => (
                  <div key={index} className="group">
                    {renamingListName === listName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newListNameInput}
                          onChange={(e) => setNewListNameInput(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveListName(listName)}
                          leftIcon={<Save className="w-4 h-4" />}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRenamingListName(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleListClick(listName)}
                        className={`
                          flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                          ${selectedListName === listName
                            ? 'bg-primary-100 border-2 border-primary-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }
                        `}
                      >
                        <span className={`font-medium ${selectedListName === listName ? 'text-primary-700' : 'text-gray-700'}`}>
                          {listName}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRenameList(listName); }}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                            title="Rename list"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmDeleteList(listName); }}
                            className="p-1.5 rounded hover:bg-error-100 text-gray-500 hover:text-error-600"
                            title="Delete list"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Words Panel */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedListName ? `${selectedListName} Words` : 'Select a List'}
                </h2>
              </div>
              <Button
                size="sm"
                onClick={() => setAddingWord(!addingWord)}
                leftIcon={addingWord ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                variant={addingWord ? 'secondary' : 'primary'}
              >
                {addingWord ? 'Cancel' : 'Add a Word'}
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {/* Add Word Form */}
            {addingWord && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">Add New Word</h3>
                <div className="space-y-3">
                  <Select
                    label="Vocabulary List"
                    options={getListOptions()}
                    value={newWordListName || ''}
                    onChange={(e) => handleNewWordListNameChange(e.target.value)}
                  />

                  {creatingNewList && (
                    <>
                      <Input
                        label="New List Name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter new list name"
                      />
                      <Select
                        label="Language"
                        options={languageOptions}
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                      />
                      {selectedLanguage === 'Other' && (
                        <Input
                          label="Specify Language"
                          value={otherLanguage}
                          onChange={(e) => setOtherLanguage(e.target.value)}
                          placeholder="Enter language name"
                        />
                      )}
                    </>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        label="Word (English)"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="e.g., apple"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="secondary"
                        onClick={handleGetTranslation}
                        isLoading={translating}
                        leftIcon={<Languages className="w-4 h-4" />}
                        title="Auto-translate to Spanish"
                      >
                        Translate
                      </Button>
                    </div>
                  </div>

                  <Input
                    label="Translation"
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    placeholder="e.g., manzana"
                  />

                  <Button
                    onClick={handleAddWord}
                    fullWidth
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Word
                  </Button>
                </div>
              </div>
            )}

            {/* Words List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : !selectedListName ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a list to view words</p>
              </div>
            ) : vocabulary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No words in this list yet.</p>
                <p className="text-sm">Click "Add a Word" to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vocabulary.map((word) => (
                  <div
                    key={word.vocab_id}
                    className="group p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {renamingWordId === word.vocab_id ? (
                      <div className="space-y-2">
                        <Input
                          value={newWordInput}
                          onChange={(e) => setNewWordInput(e.target.value)}
                          placeholder="Word"
                        />
                        <Input
                          value={newTranslationInput}
                          onChange={(e) => setNewTranslationInput(e.target.value)}
                          placeholder="Translation"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveRename(word.vocab_id)}
                            leftIcon={<Save className="w-4 h-4" />}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelRename}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary-700 truncate">{word.word}</p>
                          <p className="text-sm text-gray-600 truncate">{word.word_translated}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={() => handleRename(word.vocab_id)}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                            title="Edit word"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteWord(word.vocab_id, word.word)}
                            className="p-1.5 rounded hover:bg-error-100 text-gray-500 hover:text-error-600"
                            title="Delete word"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Example Sentences Section */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warning-600" />
            <h2 className="text-lg font-semibold text-gray-800">Generate Example Sentences</h2>
          </div>
        </Card.Header>
        <Card.Body>
          <p className="text-gray-600 mb-4">
            Select a vocabulary list above, then generate example sentences for all words in the list.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-32">
              <Select
                options={sentenceCountOptions}
                value={String(numSentences)}
                onChange={(e) => setNumSentences(Number(e.target.value))}
              />
            </div>
            <Button
              onClick={fetchExampleSentences}
              isLoading={loadingExamples}
              disabled={!selectedListName || vocabulary.length === 0}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Examples
            </Button>
            {selectedListName && (
              <span className="text-sm text-gray-500">
                for {vocabulary.length} words in "{selectedListName}"
              </span>
            )}
          </div>

          {/* Example Sentences Results */}
          {loadingExamples && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-3 text-gray-500">Generating example sentences...</p>
              </div>
            </div>
          )}

          {!loadingExamples && Object.keys(exampleSentences).length > 0 && (
            <div className="space-y-4 mt-4">
              {Object.entries(exampleSentences).map(([word, sentences]) => (
                <div key={word} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-primary-700 mb-2">{word}</h3>
                  <ul className="space-y-1">
                    {sentences.map((sentence, index) => (
                      <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-200">
                        {sentence}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Chat Section */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-800">Practice Chat</h2>
        </Card.Header>
        <Card.Body className="p-0">
          <Chat />
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'list', id: '', name: '' })}
        title={`Delete ${deleteModal.type === 'list' ? 'List' : 'Word'}`}
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete {deleteModal.type === 'list' ? 'the list' : 'the word'}{' '}
          <strong>"{deleteModal.name}"</strong>?
          {deleteModal.type === 'list' && ' This will also delete all words in this list.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteModal({ isOpen: false, type: 'list', id: '', name: '' })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Sub2;
