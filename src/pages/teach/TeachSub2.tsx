import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Languages,
  RotateCcw,
  X,
  Volume2,
  Clock
} from 'lucide-react';
import { callOpenAI } from '../../lib/edgeFunctions';
import { Card, Button, Select, Spinner } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';

type TargetLanguage = 'Spanish' | 'French' | 'German' | 'Japanese' | 'Portuguese' | 'Chinese';

const languageOptions = [
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Chinese', label: 'Chinese (Mandarin)' },
];

interface TranslationResult {
  transcription: string;
  translation: string;
  targetLanguage: string;
}

const TeachSub2: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('Spanish');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setError(null);
    setTranslationResult(null);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop audio level animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setAudioLevels(Array(20).fill(0));
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio level visualization
      const updateLevels = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          const levels = Array.from({ length: 20 }, (_, i) => {
            const index = Math.floor((i / 20) * dataArray.length);
            return dataArray[index] / 255;
          });
          setAudioLevels(levels);
        }
        animationRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Unable to access microphone. Please ensure you've granted microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setTranslationResult(null);
    setRecordingTime(0);
    setError(null);
    setIsPlaying(false);
  };

  const handleTranslate = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    setLoadingAction('Transcribing audio...');
    setError(null);

    try {
      // Convert audioBlob to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Step 1: Transcribe audio
      const transcriptionData = await callOpenAI({
        type: 'transcription',
        audioBase64: audioBase64,
        filename: 'audio.wav'
      });

      const transcription = transcriptionData.text;

      setLoadingAction(`Translating to ${targetLanguage}...`);

      // Step 2: Translate transcription
      const translationResponse = await callOpenAI({
        type: 'chat',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that translates text to ${targetLanguage}. Provide only the translation without any additional explanation.`
          },
          {
            role: 'user',
            content: `Translate the following text to ${targetLanguage}:\n\n${transcription}`
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      });

      const translation = translationResponse.choices[0].message.content;

      setTranslationResult({
        transcription,
        translation,
        targetLanguage
      });
    } catch (err) {
      console.error('Error:', err);
      setError('Sorry, there was an error processing the audio translation.');
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
          <div className="p-2 bg-warning-100 rounded-xl">
            <Mic className="w-6 h-6 text-warning-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Audio Translation</h1>
        </div>
        <p className="text-gray-600 ml-14">
          Record your voice and get instant transcription and translation.
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

      {/* Step 1: Select Target Language */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-600">1</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Select Target Language</h2>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="max-w-md">
            <Select
              options={languageOptions}
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
              leftIcon={<Languages className="w-5 h-5" />}
            />
            <p className="mt-2 text-sm text-gray-500">
              Speak in English and your audio will be translated to {targetLanguage}.
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* Step 2: Record Audio */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-600">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Record Audio</h2>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col items-center">
            {/* Recording Visualization */}
            <div className="w-full max-w-md mb-6">
              <div className="flex items-center justify-center gap-1 h-24 bg-gray-50 rounded-xl p-4">
                {isRecording ? (
                  audioLevels.map((level, index) => (
                    <div
                      key={index}
                      className="w-2 bg-warning-500 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(8, level * 80)}px`,
                        opacity: 0.5 + level * 0.5
                      }}
                    />
                  ))
                ) : audioUrl ? (
                  <div className="flex items-center gap-4">
                    <Volume2 className="w-8 h-8 text-success-500" />
                    <span className="text-gray-600">Recording ready</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mic className="w-8 h-8" />
                    <span>Click the button below to start recording</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recording Timer */}
            {(isRecording || recordingTime > 0) && (
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={`font-mono text-lg ${isRecording ? 'text-error-500' : 'text-gray-600'}`}>
                  {formatTime(recordingTime)}
                </span>
                {isRecording && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-error-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-error-500"></span>
                  </span>
                )}
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex flex-wrap justify-center gap-3">
              {!isRecording && !audioUrl && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  leftIcon={<Mic className="w-5 h-5" />}
                  className="bg-warning-500 hover:bg-warning-600"
                >
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="danger"
                  leftIcon={<MicOff className="w-5 h-5" />}
                >
                  Stop Recording
                </Button>
              )}

              {audioUrl && !isRecording && (
                <>
                  <Button
                    onClick={handlePlayPause}
                    variant="secondary"
                    leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  >
                    {isPlaying ? 'Pause' : 'Play Recording'}
                  </Button>
                  <Button
                    onClick={resetRecording}
                    variant="ghost"
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Record Again
                  </Button>
                  <Button
                    onClick={handleTranslate}
                    isLoading={isLoading}
                    disabled={isLoading}
                    size="lg"
                    leftIcon={<Languages className="w-4 h-4" />}
                  >
                    Translate
                  </Button>
                </>
              )}
            </div>

            {/* Hidden audio element for playback */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                className="hidden"
              />
            )}
          </div>
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
            {/* Side by Side Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transcription */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-700">Your Speech (English)</h3>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{translationResult.transcription}</p>
              </div>

              {/* Translation */}
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-4 h-4 text-primary-600" />
                  <h3 className="font-medium text-primary-700">{translationResult.targetLanguage} Translation</h3>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{translationResult.translation}</p>
              </div>
            </div>

            {/* New Recording Button */}
            <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={resetRecording}
                variant="secondary"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Record New Audio
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Tips Card */}
      {!translationResult && !isLoading && !isRecording && (
        <Card className="bg-gray-50 border-gray-200">
          <Card.Body>
            <h3 className="font-semibold text-gray-800 mb-3">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-2 flex-shrink-0" />
                <span>Speak clearly and at a normal pace</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-2 flex-shrink-0" />
                <span>Minimize background noise for better accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-2 flex-shrink-0" />
                <span>Pause briefly between sentences for clearer transcription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-2 flex-shrink-0" />
                <span>Use the playback feature to review your recording before translating</span>
              </li>
            </ul>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default TeachSub2;
