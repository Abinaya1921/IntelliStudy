import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./GroupChat.css";

const socket = io("http://localhost:5000");

export default function GroupStudyRoom() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the Study Room!", sender: "system", time: new Date().toLocaleTimeString() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((msgs) => [...msgs, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const message = {
      id: Date.now(),
      text: input,
      sender: "self",
      time: new Date().toLocaleTimeString(),
    };
    setMessages((msgs) => [...msgs, message]);
    socket.emit("sendMessage", message);
    setInput("");
    setTyping(false);
  };

  return (
    <div className="chat-container" role="main" aria-live="polite" aria-relevant="additions">
      <div className="chat-header">📚 Group Study Room</div>
      <div className="chat-messages" aria-label="Chat messages">
        {messages.map(({ id, text, sender, time }) => (
          <div
            key={id}
            className={`message ${sender === "self" ? "self" : sender === "system" ? "system" : "other"}`}
          >
            {text}
            <span className="message-time">{time}</span>
          </div>
        ))}
        {typing && <div className="typing-indicator">Someone is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setTyping(e.target.value.length > 0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type your message..."
          aria-label="Type message"
          style={{
            flexGrow: 1,
            padding: "10px",
            borderRadius: "12px",
            border: "1.5px solid #ddd",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "8px",
            padding: "10px 20px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#6366f1",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
