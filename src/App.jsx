import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SECRET_CODE = "260221";
const START_DATE = new Date("2021-02-26T10:41:00");

const QUESTIONS = [
  {
    question: "What color I was wearing that day?",
    options: ["Manchester Red", "Redbull Blue", "CSK Yellow", "Madrid White"],
    correctIndex: 2,
  },
  {
    question: "What exam it was?",
    options: ["DBMS", "Java", "Statistics", "Algorithms"],
    correctIndex: 1,
  },
  {
    question: "Which month we had our first picture captured",
    options: ["September", "November", "March", "February"],
    correctIndex: 2,
  },
  {
    question: "How much you waited to see me that day on the staircase?",
    options: ["12 mins", "10 mins", "5 mins", "8 mins"],
    correctIndex: 0,
  },
  {
    question: "First Kiss on?  (You can't answer it 😘)",
    options: [
      "20/06/23",
      "17/11/22",
      "06/06/24",
      "17/04/24",
    ],
    correctIndex: 2,
  },
];

const GIFT_MESSAGES = [
  "Movie Date 💕",
  "Sunset Date 🌅",
  "Museum Date 💖",
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function calcTime(start) {
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate(); months--;
  }
  if (months < 0) { months += 12; years--; }
  return { years, months, days, hours, minutes, seconds };
}

function pad(n) { return String(n).padStart(2, "0"); }

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --rose: #8B1E3F;
    --rose-light: #B03060;
    --blush: #F8E1E7;
    --gold: #C6A75E;
    --gold-light: #E2C97E;
    --ivory: #FFF8F2;
    --ivory-dark: #F5EDE3;
    --text-dark: #2C1A1A;
    --text-mid: #6B4C4C;
    --glass: rgba(255,248,242,0.55);
  }

  html, body, #root { height: 100%; width: 100%; overflow-x: hidden; }

  body {
    font-family: 'Jost', sans-serif;
    background: var(--ivory);
    color: var(--text-dark);
  }

  .serif { font-family: 'Cormorant Garamond', serif; }

  /* Animated mesh background */
  .mesh-bg {
    position: fixed; inset: 0; z-index: 0; overflow: hidden;
    background: var(--ivory);
  }
  .mesh-bg::before {
    content: '';
    position: absolute; inset: -50%;
    background: 
      radial-gradient(ellipse 60% 50% at 20% 30%, rgba(139,30,63,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 80% 70%, rgba(198,167,94,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 70% 40% at 50% 10%, rgba(248,225,231,0.6) 0%, transparent 70%);
    animation: meshMove 18s ease-in-out infinite alternate;
  }
  @keyframes meshMove {
    0% { transform: translate(0,0) rotate(0deg); }
    100% { transform: translate(3%,3%) rotate(3deg); }
  }

  /* Petal particles */
  .petal { position: fixed; pointer-events: none; z-index: 1; opacity: 0.35; font-size: 1rem; animation: petalFall linear infinite; }
  @keyframes petalFall {
    0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 0.4; }
    100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
  }

  /* Glass card */
  .glass {
    background: var(--glass);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border: 1px solid rgba(198,167,94,0.25);
    box-shadow: 0 8px 48px rgba(139,30,63,0.10), 0 2px 12px rgba(198,167,94,0.10);
  }

  /* Input */
  .code-input {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.2rem;
    letter-spacing: 0.55em;
    width: 100%;
    padding: 0.7rem 1.2rem;
    border: none;
    border-bottom: 2px solid var(--gold);
    background: transparent;
    color: var(--rose);
    text-align: center;
    outline: none;
    caret-color: var(--gold);
  }
  .code-input::placeholder { color: rgba(139,30,63,0.25); letter-spacing: 0.55em; }

  /* Gold button */
  .btn-gold {
    display: inline-flex; align-items: center; justify-content: center;
    font-family: 'Jost', sans-serif; font-weight: 500; letter-spacing: 0.15em;
    font-size: 0.85rem; text-transform: uppercase;
    padding: 0.85rem 2.5rem;
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
    background-size: 200% 200%;
    color: #fff;
    border: none; border-radius: 0; cursor: pointer;
    transition: background-position 0.4s, box-shadow 0.3s, transform 0.2s;
    box-shadow: 0 4px 20px rgba(198,167,94,0.35);
  }
  .btn-gold:hover {
    background-position: right center;
    box-shadow: 0 6px 30px rgba(198,167,94,0.5);
    transform: translateY(-1px);
  }
  .btn-gold:active { transform: translateY(0); }

  /* Timer digits */
  .timer-unit {
    display: flex; flex-direction: column; align-items: center;
    min-width: 70px;
  }
  .timer-digit {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.2rem, 6vw, 3.8rem);
    font-weight: 300; color: var(--rose); line-height: 1;
    text-shadow: 0 2px 12px rgba(139,30,63,0.2);
  }
  .timer-label {
    font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); margin-top: 0.3rem;
  }

  /* Radio */
  .radio-option {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.85rem 1.2rem; border: 1px solid rgba(198,167,94,0.25);
    cursor: pointer; transition: background 0.2s, border-color 0.2s;
    border-radius: 2px;
    font-size: 0.95rem;
  }
  .radio-option:hover { background: rgba(248,225,231,0.6); border-color: var(--gold); }
  .radio-option.selected { background: rgba(139,30,63,0.07); border-color: var(--rose); }
  .radio-dot {
    width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--gold);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .radio-dot.filled { background: var(--rose); border-color: var(--rose); }
  .radio-dot.filled::after { content: ''; width: 7px; height: 7px; background: white; border-radius: 50%; display: block; }

  /* Gift boxes */
  .gift-box { cursor: pointer; position: relative; }
  .gift-lid { transform-origin: bottom center; transition: transform 0.6s ease-in-out; }
  .gift-box.open .gift-lid { transform: rotateX(-110deg) translateY(-10px); }

  /* Balloons */
  .balloon { position: fixed; pointer-events: none; z-index: 0; animation: floatUp linear infinite; }
  @keyframes floatUp {
    0% { transform: translateY(110vh) translateX(0); opacity: 0.7; }
    50% { transform: translateY(50vh) translateX(20px); }
    100% { transform: translateY(-20vh) translateX(-10px); opacity: 0; }
  }

  /* Audio toggle */
  .audio-btn {
    position: fixed; top: 1.2rem; right: 1.2rem; z-index: 100;
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--glass); border: 1px solid rgba(198,167,94,0.4);
    backdrop-filter: blur(8px); cursor: pointer;
    color: var(--gold); font-size: 1.2rem;
    transition: background 0.2s, transform 0.2s;
    box-shadow: 0 2px 12px rgba(139,30,63,0.1);
  }
  .audio-btn:hover { background: rgba(248,225,231,0.8); transform: scale(1.05); }

  /* Divider */
  .divider {
    display: flex; align-items: center; gap: 1rem; opacity: 0.4; margin: 1rem 0;
  }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--gold); }

  /* Scroll container */
  .scene { position: relative; z-index: 10; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
`;

// ─── PETALS ───────────────────────────────────────────────────────────────────
const PETALS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 12}s`,
  duration: `${10 + Math.random() * 8}s`,
  emoji: ["🌸", "🌺", "✿", "❀"][Math.floor(Math.random() * 4)],
}));

// ─── SECTIONS ────────────────────────────────────────────────────────────────

// 1. SECRET CODE
function SecretCode({ onUnlock }) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (value === SECRET_CODE) {
      onUnlock();
    } else {
      setShake(true);
      setError("That's not quite right, my love…");
      setTimeout(() => { setShake(false); setError(""); }, 700);
    }
  }

  return (
    <div className="scene">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 440 }}
      >
        <motion.div
          className="glass"
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ padding: "3rem 2.5rem", textAlign: "center" }}
        >
          {/* Rose ornament */}
          <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>🌹</div>

          <h1 className="serif" style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "var(--rose)", fontStyle: "italic", fontWeight: 300, lineHeight: 1.2 }}>
            For Your Eyes Only
          </h1>
          <div className="divider" style={{ margin: "1.2rem 0" }}>
            <span style={{ color: "var(--gold)", fontSize: "0.7rem", letterSpacing: "0.2em" }}>ENTER SECRET CODE</span>
          </div>

          <input
            className="code-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="• • • • • •"
            aria-label="Secret 6-digit code"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: "var(--rose)", fontSize: "0.82rem", marginTop: "0.75rem", fontStyle: "italic" }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            className="btn-gold"
            onClick={handleSubmit}
            type="button"
            style={{ marginTop: "2rem", width: "100%" }}
          >
            Unlock
          </button>

          <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--text-mid)", letterSpacing: "0.05em", fontStyle: "italic" }}>
            A journey made just for you ✦
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 2. JET ANIMATION
function JetAnimation({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="scene" style={{ overflow: "hidden", background: "rgba(44,26,26,0.55)", backdropFilter: "blur(2px)", position: "fixed", inset: 0, zIndex: 50 }}>
      <motion.div
        initial={{ x: "-110vw", y: 0 }}
        animate={{ x: "115vw", y: -40 }}
        transition={{ duration: 2.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: "absolute", top: "48%", display: "flex", alignItems: "center", gap: "0" }}
      >
        {/* Contrail */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 180, opacity: [0, 0.6, 0] }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
          style={{
            height: 3,
            background: "linear-gradient(to left, rgba(255,255,255,0.7), transparent)",
            borderRadius: 99,
            marginRight: -8,
          }}
        />
        {/* Jet SVG */}
        <svg width="96" height="56" viewBox="0 0 96 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Body */}
          <path d="M8 28 Q 30 20 80 26 Q 90 27 94 28 Q 90 29 80 30 Q 30 36 8 28Z" fill="#C6A75E"/>
          {/* Cockpit */}
          <path d="M60 28 Q 72 22 85 26 Q 90 27 94 28 Q 90 29 85 30 Q 72 34 60 28Z" fill="#E2C97E"/>
          {/* Main wing */}
          <path d="M30 28 L 50 10 L 58 10 L 50 28Z" fill="#8B1E3F"/>
          <path d="M30 28 L 50 46 L 58 46 L 50 28Z" fill="#8B1E3F"/>
          {/* Rear fin */}
          <path d="M8 28 L 20 18 L 24 20 L 16 28Z" fill="#8B1E3F"/>
          <path d="M8 28 L 20 38 L 24 36 L 16 28Z" fill="#7A1B37"/>
          {/* Engine glow */}
          <ellipse cx="6" cy="28" rx="5" ry="4" fill="#C6A75E" opacity="0.7"/>
          <ellipse cx="4" cy="28" rx="3" ry="2.5" fill="#fff" opacity="0.4"/>
          {/* Window */}
          <ellipse cx="72" cy="26" rx="4" ry="3" fill="#FFF8F2" opacity="0.6"/>
        </svg>
      </motion.div>

      {/* Sparkle trail particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0, 1, 0], y: [0, (i % 2 === 0 ? -1 : 1) * (10 + i * 4)] }}
          transition={{ delay: 0.2 + i * 0.25, duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
          style={{
            position: "absolute",
            left: `${12 + i * 10}%`,
            top: "49%",
            color: "#E2C97E",
            fontSize: "0.9rem",
          }}
        >✦</motion.div>
      ))}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2.8, times: [0, 0.3, 1] }}
        className="serif"
        style={{ position: "absolute", bottom: "20%", width: "100%", textAlign: "center", color: "rgba(198,167,94,0.8)", fontSize: "clamp(1rem, 3vw, 1.4rem)", fontStyle: "italic", letterSpacing: "0.1em" }}
      >
        Love is taking flight…
      </motion.p>
    </div>
  );
}

// 3. TIMER
function TimerSection({ onReady }) {
  const [time, setTime] = useState(() => calcTime(START_DATE));
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(calcTime(START_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowBtn(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const units = [
    { label: "Years", value: time.years },
    { label: "Months", value: time.months },
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="scene">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        style={{ width: "100%", maxWidth: 680, textAlign: "center" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
            Together Since
          </p>
          <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "var(--rose)", fontWeight: 300, fontStyle: "italic" }}>
            Guess.....
          </h2>
        </motion.div>

        <div className="divider" style={{ margin: "1.5rem auto", maxWidth: 300 }}>
          <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>✦</span>
        </div>

        <div
          className="glass"
          style={{ padding: "2.5rem 1.5rem", borderRadius: 2 }}
          aria-live="polite"
          aria-label="Anniversary countdown timer"
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.2rem 2rem" }}>
            {units.map(({ label, value }, i) => (
              <motion.div
                key={label}
                className="timer-unit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={value}
                    className="timer-digit"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {pad(value)}
                  </motion.span>
                </AnimatePresence>
                <span className="timer-label">{label}</span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="serif"
            style={{ marginTop: "2rem", fontSize: "clamp(1rem, 2.5vw, 1.15rem)", color: "var(--text-mid)", fontStyle: "italic", lineHeight: 1.6 }}
          >
            "Every second with you is a gift I never want to return."
          </motion.p>
        </div>

        <AnimatePresence>
          {showBtn && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              style={{ marginTop: "2.5rem" }}
            >
              <button className="btn-gold" onClick={onReady} type="button">
                Are you ready for the quiz? ✦
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// 4. QUIZ
function QuizSection({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState("");

  const q = QUESTIONS[current];
  const progress = ((current) / QUESTIONS.length) * 100;

  function handleNext() {
    if (selected === null) { setHint("Please choose an answer, darling…"); return; }
    if (selected !== q.correctIndex) { setHint("Hmm, think again my love… 💭"); return; }
    setHint("");
    if (current + 1 >= QUESTIONS.length) { onComplete(); return; }
    setCurrent(c => c + 1);
    setSelected(null);
  }

  return (
    <div className="scene">
      <motion.div
        key={current}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 560 }}
      >
        {/* Progress bar */}
        <div style={{ height: 2, background: "rgba(198,167,94,0.2)", borderRadius: 99, marginBottom: "2rem" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            style={{ height: "100%", background: "var(--gold)", borderRadius: 99 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
          Question {current + 1} of {QUESTIONS.length}
        </p>

        <div className="glass" style={{ padding: "2.5rem 2rem" }}>
          <h3 className="serif" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)", color: "var(--rose)", fontWeight: 400, lineHeight: 1.4, marginBottom: "1.8rem" }}>
            {q.question}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`radio-option${selected === i ? " selected" : ""}`}
                onClick={() => { setSelected(i); setHint(""); }}
                role="radio"
                aria-checked={selected === i}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelected(i)}
              >
                <div className={`radio-dot${selected === i ? " filled" : ""}`} />
                <span>{opt}</span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {hint && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginTop: "1rem", color: "var(--rose)", fontSize: "0.85rem", fontStyle: "italic" }}
              >
                {hint}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            className="btn-gold"
            onClick={handleNext}
            type="button"
            style={{ marginTop: "2rem", width: "100%" }}
          >
            {current + 1 < QUESTIONS.length ? "Next →" : "Finish ✦"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// 5. GIFT SELECTION
function GiftSelection({ onReveal }) {
  const [selected, setSelected] = useState(null);
  const [opened, setOpened] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  function handleSelect(i) {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => { setOpened(true); }, 200);
    setTimeout(() => { setCardVisible(true); }, 900);
  }

  const colors = ["#8B1E3F", "#C6A75E", "#6B4C4C"];
  const ribbons = ["#C6A75E", "#8B1E3F", "#C6A75E"];

  return (
    <div className="scene">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 680, textAlign: "center" }}
      >
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
          A Surprise Awaits
        </p>
        <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "var(--rose)", fontStyle: "italic", fontWeight: 300, marginBottom: "0.5rem" }}>
          Choose Your Gift
        </h2>
        <p style={{ color: "var(--text-mid)", fontSize: "0.9rem", marginBottom: "2.5rem", fontStyle: "italic" }}>
          One of these holds something special just for you…
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {[0, 1, 2].map((i) => {
            const isSelected = selected === i;
            const isOther = selected !== null && !isSelected;
            return (
              <motion.div
                key={i}
                animate={isOther ? { opacity: 0, scale: 0.7 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ cursor: selected === null ? "pointer" : "default" }}
                onClick={() => handleSelect(i)}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  className={`gift-box${isSelected && opened ? " open" : ""}`}
                  style={{ position: "relative" }}
                  whileHover={selected === null ? { scale: 1.05, filter: "drop-shadow(0 8px 24px rgba(198,167,94,0.5))" } : {}}
                >
                  {/* Box SVG */}
                  <svg width="110" height="120" viewBox="0 0 110 120" aria-hidden="true">
                    {/* Lid */}
                    <motion.g
                      animate={isSelected && opened ? { rotateX: -110, y: -12 } : { rotateX: 0, y: 0 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      style={{ transformOrigin: "55px 60px" }}
                    >
                      <rect x="8" y="10" width="94" height="28" rx="2" fill={colors[i]} />
                      <rect x="48" y="10" width="14" height="28" fill={ribbons[i]} opacity="0.8" />
                      {/* Bow */}
                      <ellipse cx="55" cy="10" rx="18" ry="8" fill={ribbons[i]} opacity="0.9" />
                      <circle cx="55" cy="10" r="5" fill={colors[i]} />
                    </motion.g>
                    {/* Box body */}
                    <rect x="8" y="38" width="94" height="72" rx="2" fill={colors[i]} />
                    <rect x="48" y="38" width="14" height="72" fill={ribbons[i]} opacity="0.7" />
                    {/* Shine */}
                    <rect x="14" y="44" width="6" height="60" rx="3" fill="white" opacity="0.1" />
                  </svg>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Revealed card */}
        <AnimatePresence>
          {cardVisible && selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="glass"
              style={{ marginTop: "2.5rem", padding: "2rem 2rem", textAlign: "center", maxWidth: 440, marginInline: "auto" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💌</div>
              <p className="serif" style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)", color: "var(--rose)", fontStyle: "italic", lineHeight: 1.7 }}>
                {GIFT_MESSAGES[selected]}
              </p>
              <button
                className="btn-gold"
                type="button"
                onClick={onReveal}
                style={{ marginTop: "1.8rem" }}
              >
                Continue ✦
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// 6. FINAL REVEAL
const BALLOON_COUNT = 14;
const balloons = Array.from({ length: BALLOON_COUNT }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${7 + Math.random() * 6}s`,
  size: 0.8 + Math.random() * 0.7,
  hue: Math.random() > 0.5 ? "#8B1E3F" : "#C6A75E",
}));

function FinalReveal() {
  return (
    <div className="scene" style={{ position: "relative", overflow: "hidden", textAlign: "center" }}>
      {/* Balloons */}
      {balloons.map((b) => (
        <div
          key={b.id}
          className="balloon"
          style={{
            left: b.left,
            bottom: "-10%",
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
          aria-hidden="true"
        >
          <svg width={`${36 * b.size}`} height={`${50 * b.size}`} viewBox="0 0 36 50">
            <ellipse cx="18" cy="18" rx="16" ry="18" fill={b.hue} opacity="0.75" />
            <line x1="18" y1="36" x2="18" y2="50" stroke={b.hue} strokeWidth="1.5" opacity="0.5" />
            <ellipse cx="12" cy="12" rx="4" ry="5" fill="white" opacity="0.15" />
          </svg>
        </div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 500, margin: "auto" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.175, 0.885, 0.32, 1.275] }}
          style={{ fontSize: "4rem", marginBottom: "1.5rem" }}
        >
          ❤️
        </motion.div>

        <motion.h1
          className="serif"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            fontSize: "clamp(2.8rem, 10vw, 5rem)",
            color: "var(--rose)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.1,
            textShadow: "0 4px 32px rgba(139,30,63,0.18)",
          }}
        >
          I Love You
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 0.7 }}
          style={{ height: 1, background: "linear-gradient(to right, transparent, var(--gold), transparent)", margin: "1.5rem auto", maxWidth: 200 }}
        />

        <motion.p
          className="serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          style={{ fontSize: "clamp(1rem, 3vw, 1.3rem)", color: "var(--text-mid)", fontStyle: "italic", lineHeight: 1.7 }}
        >
          Today, yesterday, and every day that will ever come, you are my greatest love story.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{ marginTop: "2rem", fontSize: "1.6rem", letterSpacing: "0.3em" }}
        >
          🌹 ✦ 🌹
        </motion.p>
      </motion.div>
    </div>
  );
}

// ─── AUDIO BUTTON ─────────────────────────────────────────────────────────────
function AudioToggle({ playing, onToggle }) {
  return (
    <motion.button
      className="audio-btn"
      onClick={onToggle}
      type="button"
      aria-label={playing ? "Pause music" : "Play music"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      title={playing ? "Pause" : "Play romantic music"}
    >
      {playing ? "🔊" : "🔇"}
    </motion.button>
  );
}

/* ================================
   APP
================================ */
export default function App() {
  const [scene, setScene] = useState("code");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setAudioPlaying((prev) => !prev);
  }

  return (
    <>
      <style>{css}</style>

      {PETALS.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.emoji}
        </div>
      ))}

      <div className="mesh-bg" />

      {scene !== "code" && (
        <AudioToggle
          playing={audioPlaying}
          onToggle={toggleAudio}
        />
      )}

      <AnimatePresence mode="wait">
        {scene === "code" && (
          <motion.div key="code" exit={{ opacity: 0 }}>
            <SecretCode
              onUnlock={() => {
                setScene("jet");
                setTimeout(() => {
                  if (audioRef.current) {
                    audioRef.current.play();
                    setAudioPlaying(true);
                  }
                }, 300);
              }}
            />
          </motion.div>
        )}

        {scene === "jet" && (
          <JetAnimation
            key="jet"
            onDone={() => setScene("timer")}
          />
        )}

        {scene === "timer" && (
          <motion.div key="timer">
            <TimerSection
              onReady={() => setScene("quiz")}
            />
          </motion.div>
        )}

        {scene === "quiz" && (
          <motion.div key="quiz">
            <QuizSection
              onComplete={() => setScene("gift")}
            />
          </motion.div>
        )}

        {scene === "gift" && (
          <motion.div key="gift">
            <GiftSelection
              onReveal={() => setScene("final")}
            />
          </motion.div>
        )}

        {scene === "final" && (
          <motion.div key="final">
            <FinalReveal />
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src="/romantic-track.mp3.mpeg"
        loop
        preload="auto"
      />
    </>
  );
}