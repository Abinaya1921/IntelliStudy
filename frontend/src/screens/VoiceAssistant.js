import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./VoiceAssistant.css";

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "ta-IN", label: "Tamil" },
];

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [transcript, setTranscript] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const recognition = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API not supported in this browser.");
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = language;

    recognition.current.onresult = (event) => {
      const finalTranscript = event.results[0][0].transcript;
      setTranscript(finalTranscript);
    };

    recognition.current.onend = () => {
      if (listening) recognition.current.start();
    };

    return () => {
      if (recognition.current) recognition.current.stop();
    };
  }, [language, listening]);

  const toggleListening = () => {
    if (listening) {
      recognition.current.stop();
      setListening(false);
    } else {
      recognition.current.lang = language;
      recognition.current.start();
      setListening(true);
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setAiAnswer("");
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const askAI = async () => {
    if (!transcript.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/voice-assistant", {
        question: transcript,
        language,
      });
      setAiAnswer(res.data.answer);
      speakText(res.data.answer);
    } catch (err) {
      console.error(err);
      setAiAnswer("Sorry, could not get response from AI.");
    }
  };

  return (
    <div className="voice-assistant-wrapper">
      <h2>🎙️ Voice Assistant (Tamil & English)</h2>

      <button onClick={toggleListening}>
        {listening ? "🛑 Stop" : "🎤 Start"}
      </button>

      <select
        onChange={(e) => setLanguage(e.target.value)}
        value={language}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>

      <textarea readOnly value={transcript} rows={4} />

      <div>
        <button onClick={clearTranscript}>Clear</button>
        <button onClick={askAI}>Ask Assistant</button>
      </div>

      {aiAnswer && (
        <div>
          <strong>Assistant:</strong> {aiAnswer}
        </div>
      )}
    </div>
  );
}
