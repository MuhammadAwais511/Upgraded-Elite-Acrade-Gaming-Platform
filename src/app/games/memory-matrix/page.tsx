"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  RefreshCw,
  Trophy,
  Target,
  Timer,
  Zap,
  Eye,
  TrendingUp,
  Award,
  Flame,
  Volume2,
  VolumeX,
  Star,
} from "lucide-react";
import AuthGuard from "../../../components/AuthGuard";

interface Pattern {
  positions: number[];
  color: string;
}

type Difficulty = "easy" | "medium" | "hard";
type GameState = "menu" | "memorize" | "recall" | "result";

const GRID_SIZE = 9;

const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  {
    sequenceLength: number;
    timeToMemorize: number;
    timeToRepeat: number;
    name: string;
    color: string;
  }
> = {
  easy: { sequenceLength: 3, timeToMemorize: 3.5, timeToRepeat: 6, name: "Easy", color: "green" },
  medium: { sequenceLength: 5, timeToMemorize: 2.5, timeToRepeat: 5, name: "Medium", color: "yellow" },
  hard: { sequenceLength: 7, timeToMemorize: 1.8, timeToRepeat: 4, name: "Hard", color: "red" },
};

const COLORS = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

const DIFFICULTY_SHADOWS: Record<Difficulty, string> = {
  easy: "shadow-green-500/25",
  medium: "shadow-yellow-500/25",
  hard: "shadow-red-500/25",
};

export default function MemoryMatrixPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameState, setGameState] = useState<GameState>("menu");
  const [pattern, setPattern] = useState<Pattern[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [activeCells, setActiveCells] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [stats, setStats] = useState({ gamesPlayed: 0, perfectRounds: 0, totalScore: 0 });
  const [showInstructions, setShowInstructions] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("memoryMatrixHighScore");
    if (savedHighScore) {
      const parsed = Number.parseInt(savedHighScore, 10);
      if (!Number.isNaN(parsed)) setHighScore(parsed);
    }

    const savedStats = localStorage.getItem("memoryMatrixStats");
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats({
          gamesPlayed: Number(parsed.gamesPlayed) || 0,
          perfectRounds: Number(parsed.perfectRounds) || 0,
          totalScore: Number(parsed.totalScore) || 0,
        });
      } catch {
        // ignore invalid stored data
      }
    }

    return () => {
      clearTimers();
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [clearTimers]);

  const persistStats = useCallback((nextStats: typeof stats) => {
    localStorage.setItem("memoryMatrixStats", JSON.stringify(nextStats));
  }, []);

  const playSound = (type: "correct" | "wrong" | "levelUp" | "gameOver") => {
    if (!soundEnabled) return;

    try {
      const AudioCtx =
        window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtx) return;

      const audioContext = new AudioCtx();

      const sounds = {
        correct: { freq: 523.25, duration: 0.2 },
        wrong: { freq: 329.63, duration: 0.3 },
        levelUp: { freq: 659.25, duration: 0.4 },
        gameOver: { freq: 261.63, duration: 0.5 },
      };

      const sound = sounds[type];
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = sound.freq;
      gainNode.gain.value = 0.15;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + sound.duration);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch {
      // ignore audio errors
    }
  };

  const showFeedbackMsg = (message: string, type: "success" | "error" | "info") => {
    setFeedback({ message, type });

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 1500);
  };

  const generatePattern = useCallback(
    (forLevel: number = level) => {
      const settings = DIFFICULTY_SETTINGS[difficulty];
      const sequenceLength = Math.min(settings.sequenceLength + Math.floor(forLevel / 4), 14);
      const newPattern: Pattern[] = [];

      for (let i = 0; i < sequenceLength; i++) {
        const position = Math.floor(Math.random() * GRID_SIZE);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        newPattern.push({ positions: [position], color });
      }

      setPattern(newPattern);
      return newPattern;
    },
    [difficulty, level]
  );

  const startRecallPhase = useCallback(() => {
    setGameState("recall");
    setUserSequence([]);

    const settings = DIFFICULTY_SETTINGS[difficulty];
    setTimeLeft(settings.timeToRepeat + Math.floor(level / 3));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [difficulty, level]);

  const startMemorizePhase = useCallback(
    (newPattern: Pattern[]) => {
      setGameState("memorize");
      const settings = DIFFICULTY_SETTINGS[difficulty];
      setTimeLeft(settings.timeToMemorize);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        let index = 0;

        const showNextCell = () => {
          if (index >= newPattern.length) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            startRecallPhase();
            return;
          }

          setActiveCells(new Set(newPattern[index].positions));
          setTimeout(() => setActiveCells(new Set()), 450);
          index += 1;
        };

        showNextCell();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(showNextCell, 1000);
        }
      }, 0);
    },
    [difficulty, startRecallPhase]
  );

  const handleGameOver = useCallback(() => {
    setGameState("result");
    playSound("gameOver");
    clearTimers();
    showFeedbackMsg(`Game Over! Score: ${score}`, "info");
  }, [clearTimers, score]);

  const startGame = () => {
    clearTimers();

    setScore(0);
    setLevel(1);
    setGameState("memorize");
    setShowInstructions(false);

    setStats((prev) => {
      const nextStats = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };
      persistStats(nextStats);
      return nextStats;
    });

    const newPattern = generatePattern(1);
    startMemorizePhase(newPattern);
  };

  const handleCellClick = (index: number) => {
    if (gameState !== "recall") return;

    const newSequence = [...userSequence, index];
    setUserSequence(newSequence);

    setActiveCells(new Set([index]));
    setTimeout(() => setActiveCells(new Set()), 200);

    const currentPatternIndex = newSequence.length - 1;
    const expectedPosition = pattern[currentPatternIndex]?.positions[0];

    if (index === expectedPosition) {
      playSound("correct");

      if (newSequence.length === pattern.length) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const roundBonus = Math.floor(timeLeft * 15);
        const pointsEarned = 100 + roundBonus + level * 10;
        const newScore = score + pointsEarned;
        const nextLevel = level + 1;

        setScore(newScore);

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem("memoryMatrixHighScore", newScore.toString());
        }

        setLevel(nextLevel);
        playSound("levelUp");
        showFeedbackMsg(`Level ${nextLevel}! +${pointsEarned} pts 🎉`, "success");

        setStats((prev) => {
          const nextStats = {
            ...prev,
            perfectRounds: prev.perfectRounds + 1,
            totalScore: prev.totalScore + pointsEarned,
          };
          persistStats(nextStats);
          return nextStats;
        });

        const newPattern = generatePattern(nextLevel);
        setTimeout(() => startMemorizePhase(newPattern), 800);
      }
    } else {
      playSound("wrong");
      showFeedbackMsg(`Wrong! Expected ${expectedPosition + 1}`, "error");
      handleGameOver();
    }
  };

  const resetGame = () => {
    clearTimers();
    setGameState("menu");
    setUserSequence([]);
    setActiveCells(new Set());
    setPattern([]);
    setShowInstructions(true);
  };

  const getCellStyle = (index: number) => {
    const isActive = activeCells.has(index);
    const patternIndex = pattern.findIndex((p, i) => p.positions[0] === index && i < userSequence.length);

    if (isActive) {
      return {
        backgroundColor: pattern[pattern.findIndex((p) => p.positions[0] === index)]?.color || "#8b5cf6",
        boxShadow: "0 0 30px rgba(139, 92, 246, 0.7)",
        transform: "scale(0.97)",
      };
    }

    if (patternIndex !== -1 && gameState === "recall") {
      return {
        backgroundColor: pattern[patternIndex]?.color,
        opacity: 0.6,
        boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)",
      };
    }

    return { backgroundColor: "rgba(30, 41, 59, 0.95)" };
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                background: `radial-gradient(circle, hsla(${Math.random() * 360}, 70%, 60%, 0.3), transparent)`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [null, -80, null],
                opacity: [0, 0.4, 0],
                x: [null, (Math.random() - 0.5) * 50, null],
              }}
              transition={{
                duration: 4 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        <div className="relative px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 md:mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-purple-200 mb-4 backdrop-blur-sm">
                <Brain className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Memory Matrix</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                Memory Matrix
              </h1>
              <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                Challenge your brain • Memorize patterns • Test your recall
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-12">
              {[
                { icon: Trophy, label: "Score", value: score, gradient: "from-yellow-400 to-orange-400", textColor: "text-yellow-400" },
                { icon: Target, label: "Level", value: level, gradient: "from-purple-400 to-pink-400", textColor: "text-purple-400" },
                { icon: Timer, label: "Time", value: timeLeft, gradient: "from-blue-400 to-cyan-400", textColor: "text-blue-400", suffix: "s" },
                { icon: Award, label: "Best", value: highScore, gradient: "from-orange-400 to-red-400", textColor: "text-orange-400" },
                { icon: Flame, label: "Perfect", value: stats.perfectRounds, gradient: "from-red-400 to-pink-400", textColor: "text-red-400" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2 }}
                  className="relative overflow-hidden bg-slate-900/70 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 text-center border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 hover:opacity-5 transition-opacity`} />
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-5 mx-auto mb-1 md:mb-2 ${stat.textColor}`} />
                  <p className="text-xs md:text-sm text-slate-400">{stat.label}</p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                    {stat.value}
                    {stat.suffix && <span className="text-xs md:text-sm ml-0.5">{stat.suffix}</span>}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6 md:mb-8">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 md:p-2.5 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-all hover:scale-105"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5" />}
              </button>

              {gameState === "menu" && showInstructions && (
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-xs md:text-sm text-slate-400 hover:text-white transition px-3 py-1 rounded-full bg-slate-800/50"
                >
                  Hide Tips
                </button>
              )}
            </div>

            <AnimatePresence>
              {gameState === "menu" && showInstructions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 md:mb-8 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-500/20">
                    <h3 className="text-purple-300 font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                      <Star className="w-4 h-4 md:w-5 md:h-5" /> How to Play Memory Matrix
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm text-slate-300">
                      <div className="flex items-start gap-2 p-2 md:p-3 bg-white/5 rounded-lg">
                        <Eye className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <span>Watch the pattern of highlighted cells carefully</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 md:p-3 bg-white/5 rounded-lg">
                        <Brain className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <span>Memorize both positions AND colors</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 md:p-3 bg-white/5 rounded-lg">
                        <Zap className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                        <span>Repeat the exact sequence in order</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 md:p-3 bg-white/5 rounded-lg">
                        <Timer className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <span>Faster completion = Higher bonus points!</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {gameState === "menu" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-3 md:gap-4 mb-8 md:mb-12"
              >
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-5 md:px-7 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                      difficulty === diff
                        ? `bg-gradient-to-r ${
                            diff === "easy"
                              ? "from-green-500 to-emerald-500"
                              : diff === "medium"
                                ? "from-yellow-500 to-orange-500"
                                : "from-red-500 to-rose-500"
                          } text-white shadow-lg ${DIFFICULTY_SHADOWS[diff]} scale-105`
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}

            {(gameState === "memorize" || gameState === "recall") && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-center mb-6 md:mb-8 p-3 md:p-4 rounded-xl md:rounded-2xl ${
                  gameState === "memorize"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                    : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                }`}
              >
                {gameState === "memorize" ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                    <Eye className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 animate-pulse" />
                    <span className="text-cyan-300 font-medium text-sm md:text-base">Memorize the pattern!</span>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 font-mono font-bold">{timeLeft}s</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 animate-pulse" />
                    <span className="text-yellow-300 font-medium text-sm md:text-base">Repeat the sequence!</span>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-mono font-bold">
                        {userSequence.length}/{pattern.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 font-mono font-bold">{timeLeft}s</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/70 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-white/10 shadow-2xl"
            >
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {Array.from({ length: GRID_SIZE }).map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: gameState === "recall" ? 1.05 : 1 }}
                      whileTap={{ scale: gameState === "recall" ? 0.97 : 1 }}
                      onClick={() => handleCellClick(index)}
                      disabled={gameState !== "recall"}
                      className={`group
                        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32
                        rounded-xl sm:rounded-2xl transition-all duration-200 relative overflow-hidden shadow-lg
                        ${gameState === "recall" ? "cursor-pointer hover:shadow-xl" : "cursor-default"}
                      `}
                      style={getCellStyle(index)}
                      animate={activeCells.has(index) ? { scale: [1, 0.97, 1] } : {}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl sm:rounded-2xl" />
                      {gameState === "recall" && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm animate-pulse" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mt-8 md:mt-10 lg:mt-12 max-w-md mx-auto">
                {gameState === "menu" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                    className="w-full py-3 md:py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-size-200 animate-gradient text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
                  >
                    <Brain className="w-5 h-5 md:w-6 md:h-6" />
                    Start Game
                  </motion.button>
                )}

                {gameState === "result" && (
                  <div className="space-y-4 md:space-y-5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center p-6 md:p-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl md:rounded-2xl"
                    >
                      <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-3" />
                      <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{score}</p>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">Final Score</p>
                      {score === highScore && score > 0 && (
                        <p className="text-green-400 text-xs md:text-sm mt-2 animate-pulse">🏆 New High Score! 🏆</p>
                      )}
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetGame}
                      className="w-full py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-xl transition-all"
                    >
                      <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
                      Play Again
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {gameState === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto"
              >
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl p-3 md:p-4 text-center border border-white/10">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Games Played</p>
                  <p className="text-lg md:text-xl font-bold text-white">{stats.gamesPlayed}</p>
                </div>
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl p-3 md:p-4 text-center border border-white/10">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Total Score</p>
                  <p className="text-lg md:text-xl font-bold text-white">{stats.totalScore}</p>
                </div>
              </motion.div>
            )}

            {feedback && (
              <div
                className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-full text-sm shadow-xl backdrop-blur-xl border ${
                  feedback.type === "success"
                    ? "bg-green-500/20 border-green-400/30 text-green-200"
                    : feedback.type === "error"
                      ? "bg-red-500/20 border-red-400/30 text-red-200"
                      : "bg-slate-800/80 border-white/10 text-slate-100"
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </AuthGuard>
  );
}