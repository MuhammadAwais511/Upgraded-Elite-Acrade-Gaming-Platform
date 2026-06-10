"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, Zap, Target, Trophy, RefreshCw,
  TrendingUp, Clock, Brain, Flame,
  Volume2, VolumeX, PartyPopper, AlertTriangle
} from "lucide-react";
import AuthGuard from "../../../components/AuthGuard";

// ---------- Type Definitions ----------
type ColorPattern = {
  color: string;
  bgClass: string;
  text: string;
};

type Message = {
  text: string;
  type: "success" | "error" | "info";
};

// ---------- Constants ----------
const COLORS: ColorPattern[] = [
  { color: "Red", bgClass: "bg-red-500", text: "RED" },
  { color: "Blue", bgClass: "bg-blue-500", text: "BLUE" },
  { color: "Green", bgClass: "bg-green-500", text: "GREEN" },
  { color: "Yellow", bgClass: "bg-yellow-500", text: "YELLOW" },
  { color: "Purple", bgClass: "bg-purple-500", text: "PURPLE" },
  { color: "Orange", bgClass: "bg-orange-500", text: "ORANGE" }
];

const INITIAL_TIME = 30;
const LOW_TIME_THRESHOLD = 5;

// Pre‑computed background particles
const PARTICLES = Array.from({ length: 40 }, () => ({
  background: `hsl(${Math.random() * 360}, 70%, 60%)`,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 2,
}));

// ---------- Custom Hook for Audio ----------
const useAudio = (soundEnabled: boolean) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio not supported
      }
    },
    [soundEnabled]
  );

  const playCorrect = useCallback(() => playTone(523.25, 0.2), [playTone]);
  const playWrong = useCallback(() => playTone(329.63, 0.3, "square"), [playTone]);
  const playGameOver = useCallback(() => {
    playTone(196.00, 0.4, "triangle");
    setTimeout(() => playTone(164.81, 0.5, "triangle"), 400);
  }, [playTone]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { playCorrect, playWrong, playGameOver };
};

// ---------- Game Over Modal ----------
const GameOverModal = ({
  score,
  highScore,
  isNewHighScore,
  onRestart,
}: {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", damping: 15 }}
      className="bg-slate-900/95 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-4">
        <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Time is Up!</h2>
      {isNewHighScore && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-2 text-purple-400 mb-4"
        >
          <PartyPopper className="w-5 h-5" />
          <span className="font-semibold">New High Score!</span>
          <PartyPopper className="w-5 h-5" />
        </motion.div>
      )}
      <div className="flex flex-col sm:flex-row justify-center gap-8 my-6">
        <div>
          <p className="text-slate-400 text-sm">Score</p>
          <p className="text-4xl font-bold text-white">{score}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Best</p>
          <p className="text-4xl font-bold text-purple-300">{highScore}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Play Again
      </motion.button>
    </motion.div>
  </motion.div>
);

// ---------- Main Component ----------
export default function ColorCascadePage() {
  // Game state
  const [currentPattern, setCurrentPattern] = useState<ColorPattern>(COLORS[0]);
  const [targetColor, setTargetColor] = useState<ColorPattern>(COLORS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState<Message | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Audio
  const { playCorrect, playWrong, playGameOver } = useAudio(soundEnabled);

  // Load high score
  useEffect(() => {
  localStorage.setItem(
    "colorCascadeHighScore",
    highScore.toString()
  );
}, [highScore]);

  // Save high score
  const saveHighScore = useCallback(
    (finalScore: number) => {
      if (finalScore > highScore) {
        setHighScore(finalScore);
        setIsNewHighScore(true);
        localStorage.setItem("colorCascadeHighScore", finalScore.toString());
      } else {
        setIsNewHighScore(false);
      }
    },
    [highScore]
  );

  // Display temporary message
  const showMessage = useCallback((text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => setMessage(null), 1200);
  }, []);

  // Generate new colour pair (word ≠ ink)
  const generatePattern = useCallback(() => {
    let wordColor: ColorPattern;
    let inkColor: ColorPattern;
    do {
      wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      inkColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (wordColor.color === inkColor.color);

    setCurrentPattern({ ...inkColor, text: wordColor.text });
    setTargetColor(inkColor);
  }, []);

  // Handle answer
  const handleAnswer = useCallback(
    (answer: ColorPattern) => {
      if (!gameActive || gameOver) return;

      const reactionTime = Date.now() - startTimeRef.current;
      setLastReactionTime(reactionTime);
      setReactionTimes((prev) => [...prev.slice(-9), reactionTime]);

      const isCorrect = answer.color === targetColor.color;

      if (isCorrect) {
        const pointsEarned = 10 + Math.floor(combo / 5) * 5;
        setScore((prev) => prev + pointsEarned);
        setCombo((prev) => prev + 1);
        playCorrect();
        showMessage(`+${pointsEarned} points! 🔥`, "success");

        if (reactionTime < 500) {
          setTimeLeft((prev) => prev + 1);
          showMessage("Fast reaction! +1 sec ⚡", "success");
        }
        if (reactionTime < 300) {
          setTimeLeft((prev) => prev + 1);
          showMessage("Insane speed! +1 sec 🚀", "success");
        }
      } else {
        setCombo(0);
        playWrong();
        showMessage(`Wrong! It was ${targetColor.color} ❌`, "error");
      }

      generatePattern();
      startTimeRef.current = Date.now();
    },
    [
      gameActive, gameOver, targetColor, combo,
      playCorrect, playWrong, showMessage, generatePattern,
    ]
  );

  // End game manually (called from timer)
  const endGame = useCallback(() => {
    if (!gameActive) return;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setGameActive(false);
    setGameOver(true);
    const finalScore = scoreRef.current;
    saveHighScore(finalScore);
    playGameOver();
    showMessage(`Game Over! Score: ${finalScore}`, "info");
  }, [gameActive, saveHighScore, playGameOver, showMessage]);

  // Start game
  const startGame = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);

    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setCombo(0);
    setGameActive(true);
    setGameOver(false);
    setReactionTimes([]);
    setLastReactionTime(null);
    setIsNewHighScore(false);
    generatePattern();
    startTimeRef.current = Date.now();

    gameLoopRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up – end game via the function to avoid stale closures
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [generatePattern, endGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  // Derived stats
  const avgReactionTime =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : null;
  const bestReactionTime =
    reactionTimes.length > 0 ? Math.min(...reactionTimes) : null;

  const isTimeLow = timeLeft <= LOW_TIME_THRESHOLD && gameActive;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 flex flex-col">
        {/* Animated background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: p.background,
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [null, -40, null],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6 sm:gap-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 mb-4 text-sm sm:text-base">
              <Eye className="w-4 h-4" />
              <span>Stroop Challenge</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Color Cascade
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Match the <span className="text-yellow-400 font-semibold">COLOR</span>, not the word!
            </p>
          </motion.div>

          {/* GAME AREA (FIRST) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            {/* Color Word Display */}
            <div
              className={`
                relative rounded-3xl p-8 sm:p-12 transition-all duration-300
                ${gameActive ? "cursor-pointer" : "cursor-default"}
                ${currentPattern.bgClass}
              `}
            >
              <div className="absolute inset-0 bg-black/20 rounded-3xl" />
              <div className="relative text-center">
                <motion.p
                  key={currentPattern.text}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white drop-shadow-2xl"
                >
                  {currentPattern.text}
                </motion.p>
              </div>
            </div>

            {/* Big Score Display */}
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white">
                {score}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest">
                Score
              </p>
            </div>

            {/* Color Buttons Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {COLORS.map((color) => (
                <motion.button
                  key={color.color}
                  whileHover={gameActive && !gameOver ? { scale: 1.05 } : {}}
                  whileTap={gameActive && !gameOver ? { scale: 0.95 } : {}}
                  onClick={() => handleAnswer(color)}
                  disabled={!gameActive || gameOver}
                  aria-label={`Select ${color.color}`}
                  className={`
                    ${color.bgClass} rounded-xl p-4 font-bold text-white shadow-lg
                    transition-all duration-200
                    ${!gameActive || gameOver ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:brightness-110"}
                  `}
                >
                  <span className="text-sm sm:text-base md:text-lg">{color.color}</span>
                </motion.button>
              ))}
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition self-end"
                aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {(!gameActive || gameOver) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  <RefreshCw className="w-5 h-5" />
                  {score > 0 ? "Play Again" : "Start Game"}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* STATS BAR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          >
            {[
              { icon: Target, label: "Score", value: score, color: "text-yellow-400" },
              {
                icon: Clock,
                label: "Time",
                value: timeLeft,
                color: isTimeLow ? "text-red-400" : "text-blue-400",
                suffix: "s",
                pulse: isTimeLow,
              },
              { icon: Flame, label: "Combo", value: combo, color: "text-orange-400", suffix: "x" },
              { icon: Zap, label: "Last", value: lastReactionTime ?? "—", color: "text-green-400", suffix: "ms" },
              { icon: Trophy, label: "Best", value: highScore, color: "text-purple-400" }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-3 text-center border border-slate-700/50"
              >
                <motion.div
                  animate={stat.pulse ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block"
                >
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                </motion.div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-white">
                  {stat.value}
                  {stat.suffix && <span className="text-sm ml-1">{stat.suffix}</span>}
                </p>
              </div>
            ))}
          </motion.div>

          {/* EXTRA CARDS (reaction stats + how to play) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reactionTimes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-medium">Reaction Stats</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average</span>
                    <span className="text-white font-bold">{avgReactionTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best</span>
                    <span className="text-green-400 font-bold">{bestReactionTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rounds</span>
                    <span className="text-white font-bold">{reactionTimes.length}</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-medium">How to Play</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Focus on the <span className="text-yellow-400 font-semibold">INK COLOR</span>, not the word.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Tap the matching color button quickly.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Speed = bonus time & higher combo points!
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Keep the streak alive for max score.
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameOver && (
            <GameOverModal
              score={score}
              highScore={highScore}
              isNewHighScore={isNewHighScore}
              onRestart={startGame}
            />
          )}
        </AnimatePresence>

        {/* Toast Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`
                fixed top-24 left-1/2 transform -translate-x-1/2
                px-6 py-3 rounded-xl font-medium shadow-lg z-40 text-sm sm:text-base
                ${message.type === "success"
                  ? "bg-green-500 text-white"
                  : message.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
                }
              `}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
} 