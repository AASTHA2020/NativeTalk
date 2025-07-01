import React, { useState } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  // Add more as needed
];

// Dummy voices for demo; in real app, fetch from Murf API
const VOICES = [
  { id: "en-1", name: "English Voice 1", language: "en" },
  { id: "hi-1", name: "Hindi Voice 1", language: "hi" },
  { id: "es-1", name: "Spanish Voice 1", language: "es" },
];

export default function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [audioUrl, setAudioUrl] = useState("");
  const [explanation, setExplanation] = useState("");
  const [mode, setMode] = useState("explain");
  const [loading, setLoading] = useState(false);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Filter voices by selected language
  const filteredVoices = VOICES.filter((v) => v.language === language);

  // Handle speech-to-text
  const handleMic = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language });
  };

  // Handle Murf TTS
  const handleSpeak = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/speak", {
        text: transcript || text,
        voice,
        language,
      });
      setAudioUrl(res.data.audioUrl);
    } catch (err) {
      alert("Murf API error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  // Handle OpenAI explain/translate
  const handleExplain = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/explain", {
        text: transcript || text,
        language: LANGUAGES.find((l) => l.code === language)?.name,
        mode,
      });
      setExplanation(res.data.result);
    } catch (err) {
      alert("OpenAI API error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  // Download audio
  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "output.mp3";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">🌐 Language Assistant</h1>
        <div className="mb-4 flex flex-col gap-2">
          <label className="font-semibold">Type or Speak a Sentence:</label>
          <textarea
            className="border rounded p-2 w-full min-h-[60px]"
            value={transcript || text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your sentence here..."
          />
          <button
            className={`mt-2 px-4 py-2 rounded bg-blue-500 text-white flex items-center gap-2 ${listening ? "bg-blue-700" : ""}`}
            onClick={handleMic}
            disabled={listening}
          >
            🎤 {listening ? "Listening..." : "Start Mic"}
          </button>
        </div>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="font-semibold">Language:</label>
            <select
              className="border rounded p-2 w-full"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setVoice(VOICES.find((v) => v.language === e.target.value)?.id || "");
              }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="font-semibold">Voice:</label>
            <select
              className="border rounded p-2 w-full"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            >
              {filteredVoices.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <button
            className="flex-1 px-4 py-2 rounded bg-green-500 text-white"
            onClick={handleSpeak}
            disabled={loading}
          >
            ▶️ Speak
          </button>
          <button
            className="flex-1 px-4 py-2 rounded bg-purple-500 text-white"
            onClick={handleExplain}
            disabled={loading}
          >
            💡 {mode === "explain" ? "Explain" : "Translate"}
          </button>
          <select
            className="border rounded p-2"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="explain">Explain</option>
            <option value="translate">Translate</option>
          </select>
        </div>
        {audioUrl && (
          <div className="mb-4 flex flex-col items-center">
            <audio controls src={audioUrl} className="w-full" />
            <button
              className="mt-2 px-4 py-2 rounded bg-gray-700 text-white"
              onClick={handleDownload}
            >
              ⬇️ Download Audio
            </button>
          </div>
        )}
        {explanation && (
          <div className="mb-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <strong>Result:</strong> {explanation}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-4 text-center">
          {/* Test data: Try "How do you say 'hello' in Spanish?" or "Explain: Photosynthesis" */}
          Powered by Murf & OpenAI APIs
        </div>
      </div>
    </div>
  );
}
