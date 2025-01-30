import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type TranslationType = 
  | 'Translate from English to Spanish'
  | 'Translate from Spanish to English'
  | 'Translate from English to Japanese'
  | 'Translate from English to French';

function TeachSub1() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [translationType, setTranslationType] = useState<TranslationType>('Translate from English to Spanish');
  const [lastTranslatedImage, setLastTranslatedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreamReady(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please ensure you've granted camera permissions.");
    }
  };

  const takePhoto = () => {
    if (videoRef.current && streamRef.current && isStreamReady) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg', 1.0);
        setPhoto(photoData);
        
        streamRef.current.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        setIsStreamReady(false);
      }
    }
  };

  const getTranslationPrompt = () => {
    switch (translationType) {
      case 'Translate from English to Spanish':
        return "1. Translate this text to Spanish. 2. Also provide the original English text. Format your response exactly like this: SPANISH: [Spanish translation] ENGLISH: [Original English text]";
      case 'Translate from Spanish to English':
        return "1. Translate this text to English. 2. Also provide the original Spanish text. Format your response exactly like this: ENGLISH: [English translation] SPANISH: [Original Spanish text]";
      case 'Translate from English to Japanese':
        return "1. Translate this text to Japanese. 2. Also provide the original English text. Format your response exactly like this: JAPANESE: [Japanese translation] ENGLISH: [Original English text]";
      case 'Translate from English to French':
        return "1. Translate this text to French. 2. Also provide the original English text. Format your response exactly like this: FRENCH: [French translation] ENGLISH: [Original English text]";
      default:
        return "1. Translate this text to Spanish. 2. Also provide the original English text. Format your response exactly like this: SPANISH: [Spanish translation] ENGLISH: [Original English text]";
    }
  };

  const handleTranslateImage = async () => {
    if (!photo) return;

    setIsLoading(true);
    try {
      const translationResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: getTranslationPrompt() },
              {
                type: "image_url",
                image_url: {
                  url: photo,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      });

      const translationContent = translationResponse.choices[0]?.message?.content || 'No text detected or unable to translate.';

      const targetLanguage = translationType.split(' ').pop()?.toUpperCase();
      const translatedMatch = translationContent.match(new RegExp(`${targetLanguage}:\\s*(.*?)\\s*ENGLISH:`, 's')) || 
                            translationContent.match(new RegExp(`ENGLISH:\\s*(.*?)\\s*${targetLanguage}:`, 's'));
      const englishMatch = translationContent.match(/ENGLISH:\s*(.*)/s);

      const translatedText = translatedMatch ? translatedMatch[1].trim() : 'Translation not available';
      const englishText = englishMatch ? englishMatch[1].trim() : 'Original text not available'; 

      const formattedResponse = `${targetLanguage} Translation:\n${translatedText}\n\n\nEnglish Text:\n${englishText}`;
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: formattedResponse }
      ]);
      
      setLastTranslatedImage(photo);
      setPhoto(null);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing the image translation.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeVerbs = async () => {
    if (!lastTranslatedImage) return;

    setIsLoading(true);
    try {
      const verbResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Find all translated verbs in the text and put each 'foreign language verb - original verb - conjugation with tense' on a line then go to a new line in the container so that each verb is on a single line in the response)" },
              {
                type: "image_url",
                image_url: {
                  url: lastTranslatedImage,
                },
              },
            ],
          },
        ],
        max_tokens: 3000,
      });

      const verbContent = verbResponse.choices[0]?.message?.content || 'No verbs found.';
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: verbContent }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error analyzing the verbs.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAdjectives = async () => {
    if (!lastTranslatedImage) return;

    setIsLoading(true);
    try {
      const adjectiveResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Find all adjectives in the text and put each adjective - Translated adjective on a line then go to a new line in the container so that each adjective is on a single line in the response)" },
              {
                type: "image_url",
                image_url: {
                  url: lastTranslatedImage,
                },
              },
            ],
          },
        ],
        max_tokens: 3000,
      });

      const adjectiveContent = adjectiveResponse.choices[0]?.message?.content || 'No adjectives found.';
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: adjectiveContent }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error analyzing the adjectives.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(150vh-64px)] bg-gray-800 text-white">
      <h1>Click 'Start Camera' and then click 'Take Photo' to take a picture with text you want to translate. Wait a few seconds and get your results...</h1>
      <div className="p-4 border-b border-gray-700">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-gray-700 rounded-lg shadow-md p-6">
            {!photo ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[300px] rounded-lg bg-black object-cover"
                />
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Camera size={20} />
                    Start Camera
                  </button>
                  
                  <button
                    onClick={takePhoto}
                    disabled={!isStreamReady}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      isStreamReady 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Take Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-[100px] rounded-lg overflow-hidden bg-black">
                  <img 
                    src={photo} 
                    alt="Captured photo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setPhoto(null);
                      startCamera();
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Take Another Photo
                  </button>
                  
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={handleTranslateImage}
                      disabled={isLoading}
                      className={`text-white rounded-lg transition-colors ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {isLoading ? 'Translating...' : 'Translate Text'}
                    </button>
                    
                    <select
                      value={translationType}
                      onChange={(e) => setTranslationType(e.target.value as TranslationType)}
                      className="flex-1 bg-gray-600 text-white rounded-lg px-2 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option>Translate from English to Spanish</option>
                      <option>Translate from Spanish to English</option>
                      <option>Translate from English to Japanese</option>
                      <option>Translate from English to French</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
                className="prose prose-invert max-w-none"
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        {lastTranslatedImage && !photo && !isLoading && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleAnalyzeVerbs}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Analyze verbs in the text
            </button>
            <button
              onClick={handleAnalyzeAdjectives}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Analyze Adjectives in the text
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default TeachSub1;