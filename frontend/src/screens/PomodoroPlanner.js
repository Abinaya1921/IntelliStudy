import React, { useState, useEffect, useRef } from "react";
import "./Pomodoro.css";

const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Switch mode when timer finishes
            if (onBreak) {
              setOnBreak(false);
              return WORK_DURATION;
            } else {
              setOnBreak(true);
              return BREAK_DURATION;
            }
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [running, onBreak]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const toggleRunning = () => setRunning((r) => !r);

  const resetTimer = () => {
    setRunning(false);
    setOnBreak(false);
    setTimeLeft(WORK_DURATION);
  };

  return (
    <div className="pomodoro-container" role="main">
      <h2 className="pomodoro-title">⏲️ Pomodoro Planner</h2>
      <div
        className="timer-circle"
        aria-live="polite"
        aria-label={`Timer: ${formatTime(timeLeft)}`}
      >
        {formatTime(timeLeft)}
      </div>
      <p className="timer-status">{onBreak ? "Break Time! Relax 😌" : "Work Time! Focus 💪"}</p>

      <div className="buttons-container">
        <button
          onClick={toggleRunning}
          className={`btn ${running ? "btn-pause" : "btn-start"}`}
          aria-pressed={running}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={resetTimer} className="btn btn-reset" aria-label="Reset timer">
          Reset
        </button>
      </div>
    </div>
  );
}
