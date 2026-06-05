"use client";

import { useState, useEffect, useCallback } from "react";
import AuthGuard from "../../../components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, 
  Trophy, 
  RotateCcw, 
  Zap, 
  TrendingUp,
  Clock,
  Star,
  Hash,
  Target,
  Sparkles,
  Shield,
  Scroll,
  Scissors
} from "lucide-react";

interface Choice {
  label: string;
  icon: string;
  beats: string;
  color: string;
  gradient: string;
}

interface GameHistory {
  playerChoice: string;
  computerChoice: string;
  result: "win" | "loss" | "draw";
  timestamp: Date;
}

type GameMode = "classic" | "bestOf5" | "bestOf3";
type GameStatus = "playing" | "finished";

export default function RockPaperScissorsPage() {
  const choices: Choice[] = [
    { 
      label: "Rock", 
      icon: "✊", 
      beats: "Scissors",
      color: "from-red-500 to-orange-500",
      gradient: "from-red-500/20 to-orange-500/20"
    },
    { 
      label: "Paper", 
      icon: "✋", 
      beats: "Rock",
      color: "from-blue-500 to-cyan-500",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    { 
      label: "Scissors", 
      icon: "✌️", 
      beats: "Paper",
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
  ];

  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [draws, setDraws] = useState(0);
  const [result, setResult] = useState("Choose your weapon!");
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [roundHistory, setRoundHistory] = useState<GameHistory[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);

  const maxRounds = gameMode === "bestOf5" ? 5 : gameMode === "bestOf3" ? 3 : Infinity;

  const determineWinner = (player: string, computer: string): "win" | "loss" | "draw" => {
    if (player === computer) return "draw";
    const playerChoice = choices.find(c => c.label === player);
    return playerChoice?.beats === computer ? "win" : "loss";
  };

  const getResultMessage = (winner: "win" | "loss" | "draw"): string => {
    switch (winner) {
      case "win": return "🎉 You win this round!";
      case "loss": return "😔 Computer wins this round.";
      case "draw": return "🤝 It's a draw!";
    }
  };

  const getChoiceIcon = (label: string): string => {
    return choices.find(c => c.label === label)?.icon || "❓";
  };

  const playRound = useCallback((choice: string) => {
    if (isAnimating || gameStatus === "finished") return;
    
    setIsAnimating(true);
    setShowResult(false);
    setPlayerChoice(choice);
    setComputerChoice(null);

    // Simulate computer "thinking"
    setTimeout(() => {
      const computerPick = choices[Math.floor(Math.random() * choices.length)].label;
      const winner = determineWinner(choice, computerPick);
      
      setComputerChoice(computerPick);
      setRoundNumber(prev => prev + 1);
      
      if (winner === "win") {
        setPlayerScore(s => s + 1);
        setResult(getResultMessage("win"));
        setStreak(s => {
          const newStreak = s + 1;
          if (newStreak > bestStreak) setBestStreak(newStreak);
          return newStreak;
        });
      } else if (winner === "loss") {
        setComputerScore(s => s + 1);
        setResult(getResultMessage("loss"));
        setStreak(0);
      } else {
        setDraws(s => s + 1);
        setResult(getResultMessage("draw"));
      }

      setRoundHistory(prev => [...prev, {
        playerChoice: choice,
        computerChoice: computerPick,
        result: winner,
        timestamp: new Date()
      }]);

      setShowResult(true);
      setIsAnimating(false);

      // Check if game is finished in best of modes
      if (gameMode !== "classic") {
        const totalPlayed = playerScore + computerScore + draws + 1;
        if (playerScore + 1 > maxRounds / 2 || computerScore + 1 > maxRounds / 2) {
          setGameStatus("finished");
          setResult(playerScore + 1 > computerScore ? 
            "🏆 Congratulations! You won the match!" : 
            "😞 Computer won the match. Try again!"
          );
        }
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, gameStatus, gameMode, playerScore, computerScore, draws, bestStreak, maxRounds]);

  const resetMatch = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setDraws(0);
    setResult("Choose your weapon!");
    setComputerChoice(null);
    setPlayerChoice(null);
    setIsAnimating(false);
    setGameStatus("playing");
    setRoundHistory([]);
    setShowResult(false);
    setStreak(0);
    setRoundNumber(1);
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    resetMatch();
    setTotalRounds(mode === "bestOf5" ? 5 : mode === "bestOf3" ? 3 : 0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating || gameStatus === "finished") return;
      switch(e.key.toLowerCase()) {
        case 'r': playRound("Rock"); break;
        case 'p': playRound("Paper"); break;
        case 's': playRound("Scissors"); break;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [playRound, isAnimating, gameStatus]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-10"
              initial={{ 
                // eslint-disable-next-line react-hooks/purity
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                // eslint-disable-next-line react-hooks/purity
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                // eslint-disable-next-line react-hooks/purity
                rotate: Math.random() * 360
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                // eslint-disable-next-line react-hooks/purity
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                // eslint-disable-next-line react-hooks/purity
                delay: Math.random() * 2
              }}
            >
              {["✊", "✋", "✌️"][i % 3]}
            </motion.div>
          ))}
        </div>

        <section className="relative px-4 py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm font-medium mb-4">
                <Swords className="w-4 h-4" />
                Classic Game
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                Rock Paper Scissors
              </h1>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Challenge the computer in this timeless game of strategy and luck!
              </p>
            </motion.div>

            {/* Game Mode Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-2 mb-8"
            >
              {([
                { mode: "classic", label: "Classic", icon: Zap },
                { mode: "bestOf3", label: "Best of 3", icon: Target },
                { mode: "bestOf5", label: "Best of 5", icon: Trophy }
              ] as const).map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    gameMode === mode
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              {/* Main Game Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-8"
              >
                {/* Battle Arena */}
                <div className="flex items-center justify-between mb-8">
                  <div className="text-center flex-1">
                    <p className="text-sm text-slate-400 mb-2">You</p>
                    <motion.div
                      animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
                      className="text-6xl"
                    >
                      {playerChoice ? getChoiceIcon(playerChoice) : "🤔"}
                    </motion.div>
                    <p className="text-sm text-slate-300 mt-2 font-medium">
                      {playerChoice || "Choose"}
                    </p>
                  </div>

                  <div className="text-center px-4">
                    <p className="text-3xl font-bold text-slate-500">VS</p>
                    {showResult && (
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-sm text-purple-400 mt-1"
                      >
                        {result}
                      </motion.p>
                    )}
                  </div>

                  <div className="text-center flex-1">
                    <p className="text-sm text-slate-400 mb-2">Computer</p>
                    <motion.div
                      animate={isAnimating ? { 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      className="text-6xl"
                    >
                      {computerChoice ? getChoiceIcon(computerChoice) : 
                       isAnimating ? "🤔" : "💻"}
                    </motion.div>
                    <p className="text-sm text-slate-300 mt-2 font-medium">
                      {computerChoice || "Waiting"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar for Best Of modes */}
                {gameMode !== "classic" && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>Round {Math.min(roundNumber, maxRounds)} of {maxRounds}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${((playerScore + computerScore + draws) / maxRounds) * 100}%` 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Choice Buttons */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {choices.map((choice) => (
                    <motion.button
                      key={choice.label}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => playRound(choice.label)}
                      disabled={isAnimating || gameStatus === "finished"}
                      className={`relative p-4 sm:p-6 rounded-2xl bg-linear-to-br ${choice.gradient} 
                        border border-white/10 backdrop-blur-sm transition-all
                        hover:shadow-lg hover:shadow-${choice.color.split(" ")[0].replace("from-", "")}/25
                        disabled:opacity-50 disabled:cursor-not-allowed group`}
                    >
                      <div className="text-4xl sm:text-5xl mb-2">{choice.icon}</div>
                      <div className="text-white font-medium text-sm sm:text-base">
                        {choice.label}
                      </div>
                      <div className="text-xs text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Beats {choice.beats}
                      </div>
                      <div className="absolute top-2 right-2 text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded-full">
                        {choice.label[0]}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center mt-4 text-sm text-slate-500">
                  Press R, P, or S for quick play
                </div>

                {/* Reset Button */}
                <div className="text-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetMatch}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Game
                  </motion.button>
                </div>
              </motion.div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Score Board */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-6"
                >
                  <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Score Board
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-slate-300">You</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{playerScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-slate-300">Computer</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{computerScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-slate-300">Draws</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{draws}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-6"
                >
                  <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-lg font-bold text-white">
                        {playerScore + computerScore + draws > 0
                          ? `${Math.round((playerScore / (playerScore + computerScore + draws)) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current Streak</span>
                      <span className="text-lg font-bold text-purple-400">
                        {streak > 0 ? `${streak} wins` : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Best Streak</span>
                      <span className="text-lg font-bold text-yellow-400">
                        {bestStreak > 0 ? `${bestStreak} wins` : "---"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Round History */}
                {roundHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-6"
                  >
                    <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Round History
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {roundHistory.slice().reverse().map((round, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                            round.result === "win" ? "bg-green-500/10 text-green-300" :
                            round.result === "loss" ? "bg-red-500/10 text-red-300" :
                            "bg-yellow-500/10 text-yellow-300"
                          }`}
                        >
                          <span>{getChoiceIcon(round.playerChoice)} vs {getChoiceIcon(round.computerChoice)}</span>
                          <span className="capitalize font-medium">{round.result}</span>
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