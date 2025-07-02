import React, { useState, useRef, useEffect } from "react";
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
const PRONUNCIATION_MODES = [
  { label: "Normal", mode: "normal", tooltip: "Standard pronunciation" },
  { label: "Slow", mode: "slow", tooltip: "Slower pronunciation for learning" },
  { label: "Fast", mode: "fast", tooltip: "Faster pronunciation" },
];

export default function App() {
  console.log("App component rendering");
  const [text, setText] = useState(() => {
    console.log("Initializing text state");
    return "";
  });
  const [languageCode, setLanguageCode] = useState(() => {
    console.log("Initializing languageCode state");
    return LANGUAGES[0].code;
  });
  const [voiceId, setVoiceId] = useState(() => {
    console.log("Initializing voiceId state");
    return VOICES[0].id;
  });
  const [audioUrl, setAudioUrl] = useState(() => {
    console.log("Initializing audioUrl state");
    return "";
  });
  const [loading, setLoading] = useState(() => {
    console.log("Initializing loading state");
    return false;
  });
  const [error, setError] = useState(() => {
    console.log("Initializing error state");
    return "";
  });
  const [activeMode, setActiveMode] = useState(() => {
    console.log("Initializing activeMode state");
    return 0;
  });
  const [isPlaying, setIsPlaying] = useState(() => {
    console.log("Initializing isPlaying state");
    return false;
  });
  const [darkMode, setDarkMode] = useState(() => {
    console.log("Initializing darkMode state");
    return localStorage.getItem("llp_dark") === "1";
  });
  const [history, setHistory] = useState(() => {
    console.log("Initializing history state");
    return [];
  });
  const audioRef = useRef();
  console.log("audioRef initialized", audioRef);

  useEffect(() => {
    console.log("useEffect: darkMode changed", darkMode);
    if (darkMode) {
      console.log("Adding dark class to document");
      document.documentElement.classList.add("dark");
      localStorage.setItem("llp_dark", "1");
    } else {
      console.log("Removing dark class from document");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("llp_dark", "0");
    }
  }, [darkMode]);

  useEffect(() => {
    console.log("useEffect: history changed", history);
  }, [history]);

  useEffect(() => {
    console.log("useEffect: audioUrl changed", audioUrl);
    if (!audioRef.current) {
      console.log("audioRef.current is null");
      return;
    }
    const handlePlay = () => {
      console.log("audio play event");
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log("audio pause/ended event");
      setIsPlaying(false);
    };
    audioRef.current.addEventListener("play", handlePlay);
    audioRef.current.addEventListener("ended", handlePause);
    audioRef.current.addEventListener("pause", handlePause);
    return () => {
      console.log("Cleaning up audio event listeners");
      audioRef.current.removeEventListener("play", handlePlay);
      audioRef.current.removeEventListener("ended", handlePause);
      audioRef.current.removeEventListener("pause", handlePause);
    };
  }, [audioUrl]);

  console.log("Filtering voices for languageCode:", languageCode);
  const filteredVoices = VOICES.filter((v) => v.language === languageCode);

  const handlePronounce = async (modeIdx) => {
    console.log("handlePronounce called with modeIdx:", modeIdx);
    setLoading(true);
    setError("");
    setActiveMode(modeIdx);
    setAudioUrl("");
    if (!text.trim()) {
      console.log("No text entered");
      setError("Please enter some text.");
      setLoading(false);
      return;
    }
    if (!languageCode) {
      console.log("No language selected");
      setError("Please select a language.");
      setLoading(false);
      return;
    }
    if (!voiceId) {
      console.log("No voice selected");
      setError("Please select a voice.");
      setLoading(false);
      return;
    }
    try {
      const payload = {
        text,
        language_code: languageCode,
        voice_id: voiceId,
        mode: PRONUNCIATION_MODES[modeIdx].mode,
      };
      console.log("Sending payload:", payload);
      const res = await axios.post("http://localhost:8000/generate-audio", payload);
      console.log("Received response from API:", res);
      setAudioUrl(res.data.audioUrl);
      if (text.trim()) {
        setHistory((prev) => {
          console.log("Updating history with text:", text.trim());
          const newHist = [text.trim(), ...prev.filter((h) => h !== text.trim())];
          return newHist.slice(0, 10);
        });
      }
    } catch (err) {
      console.error("TTS API error:", err, err.response);
      setError(
        err.response?.data?.error || err.response?.data?.details || err.message
      );
    }
    setLoading(false);
  };

  const handleMic = () => {
    console.log("handleMic called");
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.log("Speech recognition not supported");
      setError("Speech recognition not supported in this browser.");
      return;
    }
    setError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = languageCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      console.log("Speech recognition result:", event);
      setText(event.results[0][0].transcript);
    };
    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event);
      setError("Mic error: " + event.error);
    };
    recognition.start();
    console.log("Speech recognition started");
  };

  const handleDownload = () => {
    console.log("handleDownload called");
    if (!audioUrl) {
      console.log("No audioUrl to download");
      return;
    }
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "output.mp3";
    a.click();
    console.log("Download triggered for", audioUrl);
  };

  const handleReplay = () => {
    console.log("handleReplay called");
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      console.log("Audio replayed");
    } else {
      console.log("audioRef.current is null");
    }
  };

  // UI
  console.log("Rendering UI");
  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col items-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="w-full flex justify-between items-center mb-4">
          <h1 className={`text-2xl md:text-3xl font-extrabold font-sans tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>Language Learning Partner</h1>
          <button
            className="ml-2 p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Toggle light/dark mode"
            onClick={() => {
              console.log("Toggling dark mode");
              setDarkMode((d) => !d);
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <span role="img" aria-label="Light">🌞</span>
            ) : (
              <span role="img" aria-label="Dark">🌙</span>
            )}
          </button>
        </div>
        <textarea
          className={`border rounded-lg p-3 w-full min-h-[80px] mb-4 focus:outline-none focus:ring-2 transition ${darkMode ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-400" : "bg-white text-gray-900 border-gray-300 focus:ring-blue-400"}`}
          value={text}
          onChange={(e) => {
            console.log("Text changed:", e.target.value);
            setText(e.target.value);
          }}
          placeholder="Type a sentence, phrase, or dialogue..."
        />
        <div className="flex w-full gap-3 mb-4">
          <select
            className={`flex-1 border rounded-lg p-2 focus:outline-none ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
            value={languageCode}
            onChange={(e) => {
              console.log("Language changed:", e.target.value);
              setLanguageCode(e.target.value);
              const v = VOICES.find((v) => v.language === e.target.value);
              setVoiceId(v?.id || "");
            }}
            title="Select language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          <select
            className={`flex-1 border rounded-lg p-2 focus:outline-none ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
            value={voiceId}
            onChange={(e) => {
              console.log("Voice changed:", e.target.value);
              setVoiceId(e.target.value);
            }}
            title="Select voice"
          >
            {filteredVoices.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div className="flex w-full gap-3 mb-6">
          {PRONUNCIATION_MODES.map((mode, idx) => (
            <button
              key={mode.label}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-150 shadow-sm border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                activeMode === idx ? "bg-blue-500 text-white" : darkMode ? "bg-gray-700 text-blue-200" : "bg-white text-blue-700"
              }`}
              onClick={() => {
                console.log("Pronunciation mode button clicked:", mode.label, idx);
                handlePronounce(idx);
              }}
              disabled={loading}
              title={mode.tooltip}
            >
              {mode.label}
            </button>
          ))}
          <button
            className="p-2 rounded-lg border border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900 transition flex items-center justify-center"
            onClick={() => {
              console.log("Mic button clicked");
              handleMic();
            }}
            title="Speech to text"
            aria-label="Speech to text"
            disabled={loading}
          >
            <span role="img" aria-label="Mic">🎤</span>
          </button>
        </div>
        {loading && (
          <div className="mb-4 text-blue-500 font-semibold flex items-center gap-2">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></span>
            Generating audio...
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-500 font-semibold">{error}</div>
        )}
        {audioUrl && (
          <div className="w-full flex flex-col items-center mb-2">
            <div className="flex items-center gap-2 mb-2">
              <audio ref={audioRef} controls src={audioUrl} className="w-full" />
              <button
                className="p-2 rounded-full border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                onClick={() => {
                  console.log("Replay button clicked");
                  handleReplay();
                }}
                title="Replay audio"
              >
                <span role="img" aria-label="Replay">🔁</span>
              </button>
              <button
                className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => {
                  console.log("Download button clicked");
                  handleDownload();
                }}
                title="Download audio"
              >
                <span role="img" aria-label="Download">⬇️</span>
              </button>
              {isPlaying && (
                <span className="ml-2 animate-pulse text-blue-500 text-2xl" title="Playing">
                  <span role="img" aria-label="Speaker">🔊</span>
                </span>
              )}
            </div>
          </div>
        )}
        {history.length > 0 && (
          <div className="w-full mt-4">
            <div className="font-semibold text-gray-500 dark:text-gray-300 mb-1 text-sm">History</div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded p-2 max-h-32 overflow-y-auto">
              {history.map((h, i) => (
                <li key={i} className="truncate cursor-pointer hover:underline" title="Click to use again" onClick={() => {
                  console.log("History item clicked:", h);
                  setText(h);
                }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-xs text-gray-400 mt-6 text-center">
          Powered by Murf API
        </div>
      </div>
    </div>
  );
}
