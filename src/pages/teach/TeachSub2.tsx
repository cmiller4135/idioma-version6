import React, { useState, useRef } from 'react';
import { callOpenAI } from '../../lib/edgeFunctions';

const TeachSub2 = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setIsRecording(true);
    setTranslation(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Unable to access microphone. Please ensure you've granted microphone permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranslate = async () => {
    if (!audioBlob) return;

    setError(null);
    setTranslation(null);
    try {
      // Convert audioBlob to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:audio/wav;base64, prefix
        };
        reader.readAsDataURL(audioBlob);
      });

      const transcriptionData = await callOpenAI({
        type: 'transcription',
        audioBase64: audioBase64,
        filename: 'audio.wav'
      });

      const transcription = transcriptionData.text;

      const translationResponse = await callOpenAI({
        type: 'chat',
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that translates English to Spanish.'
          },
          {
            role: 'user',
            content: `Translate the following text to Spanish: ${transcription}`
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      });

      const translationData = translationResponse.choices[0].message.content;
      setTranslation(translationData);
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, there was an error processing the audio translation.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946]">
      <h1>Record an audio to translate.</h1>
      <div className="mt-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Stop Recording
          </button>
        )}
      </div>
      {audioBlob && (
        <div className="mt-4">
          <button
            onClick={handleTranslate}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Translate
          </button>
        </div>
      )}
      {translation && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-custom-blue mb-4">Translation</h2>
          <p className="text-gray-700">{translation}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default TeachSub2;