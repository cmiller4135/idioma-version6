import React, { useState, useRef } from 'react';
import {
  Camera,
  Image,
  Languages,
  RotateCcw,
  Sparkles,
  BookOpen,
  Type,
  ZoomIn,
  X
} from 'lucide-react';
import { callOpenAI } from '../../lib/edgeFunctions';
import { Card, Button, Select, Spinner } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';

type TranslationType =
  | 'Translate to Spanish'
  | 'Translate from Spanish to English'
  | 'Translate from English to Japanese'
  | 'Translate from English to French'
  | 'Translate from English to German'
  | 'Translate from English to Portuguese';

const translationOptions = [
  { value: 'Translate to Spanish', label: 'English → Spanish' },
  { value: 'Translate from Spanish to English', label: 'Spanish → English' },
  { value: 'Translate from English to Japanese', label: 'English → Japanese' },
  { value: 'Translate from English to French', label: 'English → French' },
  { value: 'Translate from English to German', label: 'English → German' },
  { value: 'Translate from English to Portuguese', label: 'English → Portuguese' },
];

interface TranslationResult {
  original: string;
  translated: string;
  targetLanguage: string;
}

function TeachSub1() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [translationType, setTranslationType] = useState<TranslationType>('Translate to Spanish');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [verbAnalysis, setVerbAnalysis] = useState<string | null>(null);
  const [adjectiveAnalysis, setAdjectiveAnalysis] = useState<string | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
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
      setError("Unable to access camera. Please ensure you've granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
      setIsStreamReady(false);
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
        stopCamera();
      }
    }
  };

  const resetPhoto = () => {
    setPhoto(null);
    setTranslationResult(null);
    setVerbAnalysis(null);
    setAdjectiveAnalysis(null);
    setError(null);
  };

  const getTranslationPrompt = () => {
    const prompts: Record<TranslationType, string> = {
      'Translate to Spanish': "Extract any text visible in this image. Then translate it to Spanish. Format your response exactly like this:\nORIGINAL: [Original English text]\nTRANSLATED: [Spanish translation]",
      'Translate from Spanish to English': "Extract any Spanish text visible in this image. Then translate it to English. Format your response exactly like this:\nORIGINAL: [Original Spanish text]\nTRANSLATED: [English translation]",
      'Translate from English to Japanese': "Extract any text visible in this image. Then translate it to Japanese. Format your response exactly like this:\nORIGINAL: [Original English text]\nTRANSLATED: [Japanese translation]",
      'Translate from English to French': "Extract any text visible in this image. Then translate it to French. Format your response exactly like this:\nORIGINAL: [Original English text]\nTRANSLATED: [French translation]",
      'Translate from English to German': "Extract any text visible in this image. Then translate it to German. Format your response exactly like this:\nORIGINAL: [Original English text]\nTRANSLATED: [German translation]",
      'Translate from English to Portuguese': "Extract any text visible in this image. Then translate it to Portuguese. Format your response exactly like this:\nORIGINAL: [Original English text]\nTRANSLATED: [Portuguese translation]",
    };
    return prompts[translationType];
  };

  const getTargetLanguage = (): string => {
    const languages: Record<TranslationType, string> = {
      'Translate to Spanish': 'Spanish',
      'Translate from Spanish to English': 'English',
      'Translate from English to Japanese': 'Japanese',
      'Translate from English to French': 'French',
      'Translate from English to German': 'German',
      'Translate from English to Portuguese': 'Portuguese',
    };
    return languages[translationType];
  };

  const handleTranslateImage = async () => {
    if (!photo) return;

    setIsLoading(true);
    setLoadingAction('Translating image...');
    setError(null);
    setVerbAnalysis(null);
    setAdjectiveAnalysis(null);

    try {
      const response = await callOpenAI({
        type: 'vision',
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: getTranslationPrompt() },
              {
                type: "image_url",
                image_url: { url: photo },
              },
            ],
          },
        ],
        max_tokens: 4090,
      });

      const content = response.choices[0]?.message?.content || '';

      const originalMatch = content.match(/ORIGINAL:\s*([\s\S]*?)(?=TRANSLATED:|$)/i);
      const translatedMatch = content.match(/TRANSLATED:\s*([\s\S]*?)$/i);

      setTranslationResult({
        original: originalMatch ? originalMatch[1].trim() : 'Could not extract original text',
        translated: translatedMatch ? translatedMatch[1].trim() : 'Could not generate translation',
        targetLanguage: getTargetLanguage(),
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, there was an error processing the image translation.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const handleAnalyzeVerbs = async () => {
    if (!translationResult) return;

    setIsLoading(true);
    setLoadingAction('Analyzing verbs...');
    try {
      const response = await callOpenAI({
        type: 'chat',
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `Identify all verbs in the following ${translationResult.targetLanguage} text. For each verb, provide:
- The verb as it appears in the text
- Its infinitive form
- The English translation
- The tense/mood

Format each verb on a new line like: "[verb] (infinitive: [infinitive]) - [English] - [tense]"

Text to analyze:
${translationResult.translated}`
          },
        ],
        max_tokens: 3000,
      });

      setVerbAnalysis(response.choices[0]?.message?.content || 'No verbs found.');
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, there was an error analyzing the verbs.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const handleAnalyzeAdjectives = async () => {
    if (!translationResult) return;

    setIsLoading(true);
    setLoadingAction('Analyzing adjectives...');
    try {
      const response = await callOpenAI({
        type: 'chat',
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `Identify all adjectives in the following ${translationResult.targetLanguage} text. For each adjective, provide:
- The adjective as it appears
- Its base/masculine singular form
- The English translation

Format each adjective on a new line like: "[adjective] (base: [base form]) - [English]"

Text to analyze:
${translationResult.translated}`
          },
        ],
        max_tokens: 3000,
      });

      setAdjectiveAnalysis(response.choices[0]?.message?.content || 'No adjectives found.');
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, there was an error analyzing the adjectives.');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-success-100 rounded-xl">
            <Camera className="w-6 h-6 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Photo Translation</h1>
        </div>
        <p className="text-gray-600 ml-14">
          Take a photo of text and get instant translations with verb and adjective analysis.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-error-500 hover:text-error-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Select Language */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-600">1</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Select Translation Direction</h2>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="max-w-md">
            <Select
              options={translationOptions}
              value={translationType}
              onChange={(e) => setTranslationType(e.target.value as TranslationType)}
              leftIcon={<Languages className="w-5 h-5" />}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Step 2: Camera / Photo */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-600">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Capture Photo</h2>
          </div>
        </Card.Header>
        <Card.Body>
          {!photo ? (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isStreamReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                    <Camera className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">Camera preview will appear here</p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex flex-wrap justify-center gap-3">
                {!isStreamReady ? (
                  <Button
                    onClick={startCamera}
                    leftIcon={<Camera className="w-4 h-4" />}
                    size="lg"
                  >
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={takePhoto}
                      variant="primary"
                      leftIcon={<Image className="w-4 h-4" />}
                      size="lg"
                    >
                      Take Photo
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="secondary"
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Preview */}
              <div
                className="relative bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                style={{ aspectRatio: '16/9', maxHeight: '400px' }}
                onClick={() => setShowZoom(true)}
              >
                <img
                  src={photo}
                  alt="Captured photo"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                    <ZoomIn className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              </div>

              {/* Photo Controls */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={resetPhoto}
                  variant="secondary"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Take Another Photo
                </Button>
                <Button
                  onClick={handleTranslateImage}
                  isLoading={isLoading && loadingAction === 'Translating image...'}
                  disabled={isLoading}
                  leftIcon={<Languages className="w-4 h-4" />}
                  size="lg"
                >
                  Translate Text
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <Card.Body className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p className="text-gray-500">{loadingAction}</p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Step 3: Translation Results */}
      {translationResult && !isLoading && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                <span className="text-sm font-bold text-success-600">3</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Translation Results</h2>
            </div>
          </Card.Header>
          <Card.Body>
            {/* Side by Side Translation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Original Text */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-700">Original Text</h3>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{translationResult.original}</p>
              </div>

              {/* Translated Text */}
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-4 h-4 text-primary-600" />
                  <h3 className="font-medium text-primary-700">{translationResult.targetLanguage} Translation</h3>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{translationResult.translated}</p>
              </div>
            </div>

            {/* Analysis Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleAnalyzeVerbs}
                variant="secondary"
                disabled={isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Analyze Verbs
              </Button>
              <Button
                onClick={handleAnalyzeAdjectives}
                variant="secondary"
                disabled={isLoading}
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                Analyze Adjectives
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Verb Analysis Results */}
      {verbAnalysis && !isLoading && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Verb Analysis</h2>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{verbAnalysis}</pre>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Adjective Analysis Results */}
      {adjectiveAnalysis && !isLoading && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-800">Adjective Analysis</h2>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{adjectiveAnalysis}</pre>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Tips Card */}
      {!translationResult && !isLoading && (
        <Card className="bg-gray-50 border-gray-200">
          <Card.Body>
            <h3 className="font-semibold text-gray-800 mb-3">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />
                <span>Ensure good lighting and hold the camera steady</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />
                <span>Focus on the text you want to translate - avoid cluttered backgrounds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />
                <span>Works best with printed text - handwriting may be less accurate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />
                <span>After translation, use the verb and adjective analysis to deepen your learning</span>
              </li>
            </ul>
          </Card.Body>
        </Card>
      )}

      {/* Zoom Modal */}
      {showZoom && photo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={photo}
              alt="Zoomed photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachSub1;
