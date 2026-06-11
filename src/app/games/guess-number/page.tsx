"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AuthGuard from "../../../components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  RotateCcw,
  Zap,
  BarChart3,
  HelpCircle,
  Star,
  Clock,
  Hash,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

interface GameHistoryEntry {
  attempts: number;
  time: number;
  date: string;
}

type Difficulty = "easy" | "medium" | "hard";
type GameStatus = "idle" | "correct" | "error" | "hint";

const generateNewNumber = (max: number): number =>
  Math.floor(Math.random() * max) + 1;

export default function GuessNumberPage() {
  const [maxNumber, setMaxNumber] = useState<number>(100);
  const [secretNumber, setSecretNumber] = useState<number>(() =>
    generateNewNumber(100)
  );
  const [guess, setGuess] = useState<string>("");
  const [feedback, setFeedback] = useState<string>(
    "I'm thinking of a number between 1 and 100. Can you guess it?"
  );
  const [attempts, setAttempts] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [guesses, setGuesses] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [lastGuess, setLastGuess] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [particles] = useState<Particle[]>(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1000;
    const height = typeof window !== "undefined" ? window.innerHeight : 1000;
    return Array.from({ length: 20 }, (_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isTimerRunning) return;

    const intervalId = window.setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    timerRef.current = intervalId;

    return () => {
      window.clearInterval(intervalId);
      timerRef.current = null;
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultySettings = (diff: Difficulty) => {
    switch (diff) {
      case "easy":
        return { maxAttempts: Infinity, hints: 5 };
      case "hard":
        return { maxAttempts: 7, hints: 1 };
      default:
        return { maxAttempts: 10, hints: 3 };
    }
  };

  // Central reset function that respects the chosen range and difficulty
  const resetGame = (newMax: number, newDiff: Difficulty) => {
    setSecretNumber(generateNewNumber(newMax));
    setGuess("");
    setFeedback(
      `I'm thinking of a number between 1 and ${newMax}. Can you guess it?`
    );
    setAttempts(0);
    setStatus("idle");
    setGuesses([]);
    setShowHint(false);
    setTimer(0);
    setIsTimerRunning(false);
    setLastGuess(null);
    setCelebration(false);
    inputRef.current?.focus();
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    resetGame(maxNumber, newDifficulty);
  };

  const handleRangeChange = (newRange: number) => {
    setMaxNumber(newRange);
    resetGame(newRange, difficulty);
  };

  const getHint = () => {
    setShowHint(true);
    setStatus("hint");
    const range = Math.floor(10 * (Math.random() + 1));
    const lowerBound = Math.max(1, secretNumber - range);
    const upperBound = Math.min(maxNumber, secretNumber + range);
    setFeedback(`Hint: The number is between ${lowerBound} and ${upperBound}`);
  };

  const handleGuess = () => {
    const value = Number(guess);
    if (!value || value < 1 || value > maxNumber) {
      setFeedback(`Please enter a valid number between 1 and ${maxNumber}.`);
      setStatus("error");
      return;
    }

    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setLastGuess(value);
    setGuesses((prev) => [...prev, value].slice(-10));

    if (value === secretNumber) {
      setFeedback(
        `🎉 Amazing! You found the number ${secretNumber} in ${nextAttempts} attempts!`
      );
      setStatus("correct");
      setIsTimerRunning(false);
      setCelebration(true);

      if (bestScore === null || nextAttempts < bestScore) {
        setBestScore(nextAttempts);
      }

      setGameHistory((prev) =>
        [
          ...prev,
          {
            attempts: nextAttempts,
            time: timer,
            date: new Date().toLocaleDateString(),
          },
        ].slice(-5)
      );

      setTimeout(() => setCelebration(false), 3000);
      return;
    }

    const diff = Math.abs(value - secretNumber);
    let hint = "";

    if (diff <= 5) hint = "You're burning hot! 🔥";
    else if (diff <= 10) hint = "Getting warmer! ☀️";
    else if (diff <= 20) hint = "Warm, but not quite there 🌤️";
    else if (diff <= 40) hint = "Cold, try again ❄️";
    else hint = "You're freezing! 🧊";

    setStatus("error");
    if (value < secretNumber) {
      setFeedback(`Too low! Try a higher number. ${hint}`);
    } else {
      setFeedback(`Too high! Try a lower number. ${hint}`);
    }
    setGuess("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGuess();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
              initial={{ x: particle.x, y: particle.y }}
              animate={{
                y: [particle.y, particle.y - 30, particle.y],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        <section className="relative px-4 py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Interactive Game
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                Guess The Number
              </h1>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Test your intuition and logic with this classic number guessing
                game. Can you find the secret number in the fewest attempts?
              </p>
            </motion.div>

            {/* Difficulty & Range Selectors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 mr-1">Difficulty:</span>
                {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      difficulty === diff
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>

              {/* Number Range */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 mr-1">Range:</span>
                {([10, 20, 50, 100] as number[]).map((num) => (
                  <button
                    key={num}
                    onClick={() => handleRangeChange(num)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      maxNumber === num
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
              {/* Main Game Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-8"
              >
                {/* Celebration Animation */}
                <AnimatePresence>
                  {celebration && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="text-center"
                      >
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">
                          Congratulations!
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Feedback Display */}
                <motion.div
                  key={status}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-4 rounded-2xl mb-6 flex items-start gap-3 ${
                    status === "correct"
                      ? "bg-linear-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30"
                      : status === "error"
                      ? "bg-linear-to-r from-red-500/20 to-orange-500/20 border border-red-500/30"
                      : status === "hint"
                      ? "bg-linear-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                      : "bg-slate-800/50 border border-slate-700/50"
                  }`}
                >
                  {status === "correct" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  ) : status === "error" ? (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  ) : status === "hint" ? (
                    <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                  )}
                  <p className="text-slate-200">{feedback}</p>
                </motion.div>

                {/* Guess Input */}
                <div className="space-y-4">
                  <label className="block text-sm text-slate-400 mb-2">
                    Enter your guess (1-{maxNumber})
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="number"
                        min={1}
                        max={maxNumber}
                        disabled={status === "correct"}
                        className="w-full px-6 py-3 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition disabled:opacity-50"
                        placeholder="Type your guess..."
                      />
                      <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGuess}
                      disabled={status === "correct"}
                      className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Target className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={getHint}
                      disabled={showHint || status === "correct"}
                      className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Hint
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => resetGame(maxNumber, difficulty)}
                      className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      New Game
                    </motion.button>
                  </div>
                </div>

                {/* Previous Guesses */}
                {guesses.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Recent Guesses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {guesses.map((g, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            g === secretNumber
                              ? "bg-emerald-500/20 text-emerald-300"
                              : g < secretNumber
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {g < secretNumber && (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {g > secretNumber && (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {g}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                {/* Timer Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-6"
                >
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Timer</span>
                  </div>
                  <p className="text-3xl font-bold text-white font-mono">
                    {formatTime(timer)}
                  </p>
                </motion.div>

                {/* Stats Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-6"
                >
                  <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Attempts</span>
                      <span className="text-xl font-bold text-white">
                        {attempts}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Best Score</span>
                      <span className="text-xl font-bold text-yellow-400">
                        {bestScore ? `${bestScore} guesses` : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Last Guess</span>
                      <span className="text-xl font-bold text-white">
                        {lastGuess || "---"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Game History */}
                {gameHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-6"
                  >
                    <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Recent Games
                    </h3>
                    <div className="space-y-2">
                      {gameHistory.map((game, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-slate-400">{game.date}</span>
                          <span className="text-slate-300">
                            {game.attempts} tries • {formatTime(game.time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
