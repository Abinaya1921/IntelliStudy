import React, { useEffect, useState } from "react";
import "./Gamification.css";

const badgesList = [
  { id: 1, name: "Rising Star", description: "Complete your first test" },
  { id: 2, name: "Consistent Learner", description: "Maintain 7-day streak" },
  { id: 3, name: "Quiz Master", description: "Score 90%+ in 3 quizzes" },
];

export default function Gamification() {
const [xp] = useState(50);
const [streak] = useState(5);
const [earnedBadges] = useState([1, 3]);
const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const fillBar = document.querySelector(".xp-fill");
    if (fillBar) {
      fillBar.style.width = `${xp}%`;
    }
  }, [xp]);

  const showTooltip = (badge) => {
    setTooltip(badge);
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <div className="gamification-container" role="main" aria-label="Gamification progress and badges">
      <h2>🏆 Gamification</h2>

      <section className="xp-section" aria-label={`XP progress: ${xp} percent`}>
        <p className="xp-text">Your XP Progress: {xp}%</p>
        <div className="xp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={xp}>
          <div className="xp-fill" />
        </div>
      </section>

      <section className="streak-section" aria-label={`Current streak: ${streak} days`}>
        <p className="streak-counter">🔥 Streak: {streak} days</p>
      </section>

      <section className="badges-section" aria-label="Badges earned">
        <h3>Badges Earned</h3>
        <div className="badge-list" role="list">
          {badgesList.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`badge ${earned ? "earned" : "locked"}`}
                role="listitem"
                tabIndex={0}
                aria-label={`${badge.name} badge, ${earned ? "earned" : "locked"}`}
                onMouseEnter={() => showTooltip(badge)}
                onMouseLeave={hideTooltip}
                onFocus={() => showTooltip(badge)}
                onBlur={hideTooltip}
              >
                {badge.name}
              </div>
            );
          })}
        </div>

        {tooltip && (
          <div className="tooltip" role="tooltip" aria-live="polite">
            <strong>{tooltip.name}</strong>
            <p>{tooltip.description}</p>
          </div>
        )}
      </section>
    </div>
  );
}
