// app/games/word-weaver/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Keyboard, 
  RefreshCw, 
  Lightbulb, 
  Trophy, 
  Target,
  CheckCircle2,
  XCircle,
  Timer,
  Volume2,
  VolumeX,
  Crown,
  Sparkles,
  Zap,
  Heart
} from "lucide-react";
import AuthGuard from "../../../components/AuthGuard";

// Word database by difficulty
const WORDS = {
  easy: [
    { word: "APPLE", hint: "A fruit that keeps the doctor away" },
    { word: "TIGER", hint: "A striped big cat" },
    { word: "CLOUD", hint: "Fluffy white thing in the sky" },
    { word: "MUSIC", hint: "Art of combining sounds" },
    { word: "DANCE", hint: "Moving rhythmically to music" },
    { word: "SUNNY", hint: "Bright and clear weather" },
    { word: "OCEAN", hint: "Vast body of salt water" },
    { word: "HAPPY", hint: "Feeling of joy and contentment" }
  ],
  medium: [
    { word: "MYSTERY", hint: "Something puzzling or unexplained" },
    { word: "JOURNEY", hint: "A long trip or adventure" },
    { word: "WHISPER", hint: "Speak very softly" },
    { word: "GALAXY", hint: "Massive system of stars" },
    { word: "PHANTOM", hint: "A ghostly apparition" },
    { word: "THUNDER", hint: "Loud sound after lightning" },
    { word: "CRYSTAL", hint: "Clear, sparkling mineral" }
  ],
  hard: [
    { word: "ECLIPSE", hint: "Celestial shadow event" },
    { word: "QUARTZ", hint: "Hard mineral found in watches" },
    { word: "ZEPHYR", hint: "A gentle west wind" },
    { word: "NYMPH", hint: "Mythological nature spirit" },
    { word: "JAZZ", hint: "Improvised music genre" },
    { word: "KHAKIS", hint: "Military-style trousers" },
    { word: "VOYAGE", hint: "A long journey by sea" }
  ]
};

type Difficulty = "easy" | "medium" | "hard";

interface GameStats {
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
}

export default function WordWeaverPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [currentWord, setCurrentWord] = useState("");
  const [currentHint, setCurrentHint] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<Set<string>>(new Set());
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [showHint, setShowHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0
  });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const maxWrongAttempts = difficulty === "easy" ? 8 : difficulty === "medium" ? 6 : 5;
  const remainingAttempts = maxWrongAttempts - wrongGuesses.size;

  // Load word based on difficulty
  const loadNewWord = useCallback(() => {
    const wordsList = WORDS[difficulty];
    const randomIndex = Math.floor(Math.random() * wordsList.length);
    const selected = wordsList[randomIndex];
    setCurrentWord(selected.word);
    setCurrentHint(selected.hint);
    setGuessedLetters(new Set());
    setWrongGuesses(new Set());
    setGameStatus("playing");
    setShowHint(false);
    setStartTime(Date.now());
    setTimeSpent(0);
    setShowConfetti(false);
  }, [difficulty]);

  useEffect(() => {
    loadNewWord();
  }, [loadNewWord]);

  // Timer effect
  useEffect(() => {
    if (gameStatus !== "playing") return;
    
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameStatus, startTime]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play sound effect
  const playSound = useCallback((type: "correct" | "wrong" | "win" | "lose") => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const frequencies = {
        correct: 523.25, // C5
        wrong: 329.63,   // E4
        win: [523.25, 659.25, 783.99], // C5, E5, G5
        lose: [392.00, 349.23] // G4, F4
      };
      
      if (type === "win" || type === "lose") {
        frequencies[type].forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = freq;
            gainNode.gain.value = 0.2;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
            oscillator.stop(audioContext.currentTime + 0.5);
          }, index * 200);
        });
      } else {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequencies[type];
        gainNode.gain.value = 0.2;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [soundEnabled]);

  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing") return;
    if (guessedLetters.has(letter) || wrongGuesses.has(letter)) return;

    if (currentWord.includes(letter)) {
      const newGuessedLetters = new Set(guessedLetters).add(letter);
      setGuessedLetters(newGuessedLetters);
      playSound("correct");
      
      // Check win condition
      const allLettersGuessed = currentWord
        .split("")
        .every(l => newGuessedLetters.has(l));
      
      if (allLettersGuessed) {
        setGameStatus("won");
        playSound("win");
        setShowConfetti(true);
        
        setStats(prev => ({
          wins: prev.wins + 1,
          losses: prev.losses,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1)
        }));
      }
    } else {
      const newWrongGuesses = new Set(wrongGuesses).add(letter);
      setWrongGuesses(newWrongGuesses);
      playSound("wrong");
      
      if (newWrongGuesses.size >= maxWrongAttempts) {
        setGameStatus("lost");
        playSound("lose");
        
        setStats(prev => ({
          wins: prev.wins,
          losses: prev.losses + 1,
          currentStreak: 0,
          bestStreak: prev.bestStreak
        }));
      }
    }
  };

  const getWordDisplay = () => {
    return currentWord.split("").map((letter, index) => (
      <motion.div
        key={index}
        initial={{ scale: 0, rotateX: -90 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
        className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl font-bold text-xl sm:text-2xl md:text-3xl
          ${guessedLetters.has(letter) 
            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 transform hover:scale-105" 
            : gameStatus !== "playing" && !guessedLetters.has(letter)
              ? "bg-red-500/20 text-red-300 border-2 border-red-500/50"
              : "bg-slate-800/80 text-slate-400 border-2 border-slate-700/50 backdrop-blur-sm"
          }`}
      >
        {guessedLetters.has(letter) || gameStatus !== "playing" ? letter : "?"}
      </motion.div>
    ));
  };

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [null, `${Math.random() * 100}%`],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative px-4 py-4 sm:py-8 md:py-12">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 mb-4 border border-purple-500/30">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm sm:text-base">Word Weaver Challenge</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                Word Weaver
              </h1>
              <p className="mt-2 sm:mt-3 text-slate-400 text-sm sm:text-base">Uncover the hidden word, one letter at a time</p>
            </motion.div>

            {/* Main Game Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 mb-6 border border-slate-700/50 shadow-2xl"
            >
              {/* Game Header Stats */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-sm sm:text-base font-bold text-red-400">{remainingAttempts}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">
                    <Timer className="w-4 h-4 text-blue-400" />
                    <span className="text-sm sm:text-base font-bold text-blue-400">{formatTime(timeSpent)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/50"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadNewWord}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/50"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="flex gap-2 mb-6 justify-center">
                {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                  <motion.button
                    key={diff}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setDifficulty(diff);
                      loadNewWord();
                    }}
                    className={`px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base font-medium transition-all border
                      ${difficulty === diff
                        ? "bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/25"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700/50"
                      }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </motion.button>
                ))}
              </div>

              {/* Hint Section */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-blue-300 font-medium">Hint</span>
                      </div>
                      <p className="text-blue-200 text-sm sm:text-base">{currentHint}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Word Display */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                {getWordDisplay()}
              </div>

              {/* Wrong Guesses */}
              {wrongGuesses.size > 0 && (
                <div className="text-center mb-6">
                  <p className="text-xs sm:text-sm text-slate-400 mb-2">Wrong Guesses</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from(wrongGuesses).map((letter) => (
                      <span key={letter} className="px-2 sm:px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm sm:text-base border border-red-500/30">
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint Button */}
              <div className="text-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors border border-blue-500/30 text-sm sm:text-base"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </motion.button>
              </div>

              {/* Keyboard */}
              <div className="space-y-1.5 sm:space-y-2">
                {keyboardRows.map((row, i) => (
                  <div key={i} className="flex justify-center gap-1 sm:gap-2">
                    {row.map((letter) => {
                      const isGuessed = guessedLetters.has(letter);
                      const isWrong = wrongGuesses.has(letter);
                      const isDisabled = isGuessed || isWrong || gameStatus !== "playing";
                      
                      return (
                        <motion.button
                          key={letter}
                          whileHover={!isDisabled ? { scale: 1.1 } : {}}
                          whileTap={!isDisabled ? { scale: 0.95 } : {}}
                          onClick={() => handleGuess(letter)}
                          disabled={isDisabled}
                          className={`
                            w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all
                            ${isGuessed
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                              : isWrong
                                ? "bg-red-500/50 text-red-200 cursor-not-allowed"
                                : "bg-slate-800/80 text-slate-200 hover:bg-purple-600 hover:text-white border border-slate-600/50 hover:border-purple-400"
                            }
                            ${gameStatus !== "playing" && !isGuessed && !isWrong
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                            }
                          `}
                        >
                          {letter}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            >
              {[
                { icon: Trophy, label: "Wins", value: stats.wins, color: "from-yellow-400 to-orange-400", bgColor: "bg-yellow-500/10" },
                { icon: XCircle, label: "Losses", value: stats.losses, color: "from-red-400 to-pink-400", bgColor: "bg-red-500/10" },
                { icon: Crown, label: "Streak", value: stats.currentStreak, color: "from-purple-400 to-pink-400", bgColor: "bg-purple-500/10" },
                { icon: Zap, label: "Best Streak", value: stats.bestStreak, color: "from-blue-400 to-cyan-400", bgColor: "bg-blue-500/10" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`${stat.bgColor} backdrop-blur-xl rounded-2xl p-4 text-center border border-slate-700/50`}
                >
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mx-auto mb-2`} />
                  <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Game Result Modal */}
            <AnimatePresence>
              {gameStatus !== "playing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={() => gameStatus === "lost" && loadNewWord()}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 10 }}
                    className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-center max-w-sm w-full border border-slate-700 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Confetti for win */}
                    {showConfetti && gameStatus === "won" && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: ['#fbbf24', '#a78bfa', '#f472b6', '#34d399', '#60a5fa'][i % 5],
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                              y: [0, -100 - Math.random() * 200],
                              x: [0, (Math.random() - 0.5) * 100],
                              opacity: [1, 0],
                              scale: [1, 0],
                            }}
                            transition={{
                              duration: 1 + Math.random(),
                              repeat: Infinity,
                              delay: Math.random() * 0.5,
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {gameStatus === "won" ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25"
                        >
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Victory!</h2>
                        <p className="text-slate-300 mb-2 text-sm sm:text-base">
                          You guessed "{currentWord}"
                        </p>
                        <p className="text-green-400 text-sm mb-4">
                          Time: {formatTime(timeSpent)} | Mistakes: {wrongGuesses.size}
                        </p>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25"
                        >
                          <XCircle className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Over</h2>
                        <p className="text-slate-300 mb-2 text-sm sm:text-base">
                          The word was "{currentWord}"
                        </p>
                        <p className="text-red-400 text-sm mb-4">
                          Better luck next time!
                        </p>
                      </>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loadNewWord}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl transition-shadow"
                    >
                      Play Again
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}