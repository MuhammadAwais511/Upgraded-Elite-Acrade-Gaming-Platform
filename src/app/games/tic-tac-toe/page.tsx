"use client";

import { useState, useEffect, useCallback } from "react";
import AuthGuard from "../../../components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Trophy, 
  RotateCcw, 
  Zap, 
  TrendingUp,
  Clock,
  Star,
  Users,
  Bot,
  Swords,
  Sparkles,
  Hash,
  Undo2,
  Play,
  Crown,
  Target
} from "lucide-react";

interface GameHistory {
  winner: string;
  moves: number;
  date: Date;
  mode: string;
}

type GameMode = "pvp" | "pve";
type Difficulty = "easy" | "medium" | "hard";

export default function TicTacToePage() {
  const [cells, setCells] = useState<string[]>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<string>("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("pvp");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isThinking, setIsThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [playerXScore, setPlayerXScore] = useState(0);
  const [playerOScore, setPlayerOScore] = useState(0);
  const [drawScore, setDrawScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !winner) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, winner]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkWinner = (board: string[]): { winner: string | null; line: number[] | null } => {
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    if (board.every(cell => cell !== "")) {
      return { winner: "Draw", line: null };
    }
    return { winner: null, line: null };
  };

  const getAvailableMoves = (board: string[]): number[] => {
    return board.reduce<number[]>((moves, cell, index) => {
      if (cell === "") moves.push(index);
      return moves;
    }, []);
  };

  const minimax = (board: string[], depth: number, isMaximizing: boolean): number => {
    const { winner } = checkWinner(board);
    
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (winner === "Draw") return 0;

    const availableMoves = getAvailableMoves(board);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const move of availableMoves) {
        board[move] = "O";
        const score = minimax(board, depth + 1, false);
        board[move] = "";
        bestScore = Math.max(score, bestScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const move of availableMoves) {
        board[move] = "X";
        const score = minimax(board, depth + 1, true);
        board[move] = "";
        bestScore = Math.min(score, bestScore);
      }
      return bestScore;
    }
  };

  const getBestMove = (board: string[]): number => {
    const availableMoves = getAvailableMoves(board);
    
    if (difficulty === "easy") {
      // Random move
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (difficulty === "medium") {
      // 50% chance of best move, 50% random
      if (Math.random() < 0.5) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    // Hard: Always best move using minimax
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = "O";
      const score = minimax(board, 0, false);
      board[move] = "";
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  };

  const computerMove = useCallback(() => {
    if (winner || currentPlayer !== "O" || gameMode !== "pve") return;

    setIsThinking(true);
    
    setTimeout(() => {
      const boardCopy = [...cells];
      const bestMove = getBestMove(boardCopy);
      
      if (bestMove !== undefined) {
        // eslint-disable-next-line react-hooks/immutability
        makeMove(bestMove);
      }
      
      setIsThinking(false);
    }, 500 + Math.random() * 500); // Simulate thinking time
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, currentPlayer, winner, gameMode, difficulty]);

  useEffect(() => {
    if (gameMode === "pve" && currentPlayer === "O" && !winner) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      computerMove();
    }
  }, [currentPlayer, gameMode, winner, computerMove]);

  const makeMove = (index: number) => {
    const updated = [...cells];
    updated[index] = currentPlayer;
    setCells(updated);
    setMoveHistory(prev => [...prev, index]);

    const { winner: gameWinner, line: winningLine } = checkWinner(updated);
    
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(winningLine);
      setIsTimerRunning(false);
      
      // Update scores
      if (gameWinner === "X") setPlayerXScore(s => s + 1);
      else if (gameWinner === "O") setPlayerOScore(s => s + 1);
      else setDrawScore(s => s + 1);

      // Add to history
      setGameHistory(prev => [...prev, {
        winner: gameWinner,
        moves: moveHistory.length + 1,
        date: new Date(),
        mode: gameMode
      }].slice(-10));

      if (gameWinner !== "Draw") {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const updateBoard = (index: number) => {
    if (cells[index] || winner || isThinking) return;
    if (gameMode === "pve" && currentPlayer === "O") return;
    
    if (!isTimerRunning) setIsTimerRunning(true);
    makeMove(index);
  };

  const undoMove = () => {
    if (moveHistory.length === 0 || winner || isThinking) return;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    const updated = [...cells];
    updated[lastMove] = "";
    setCells(updated);
    setMoveHistory(prev => prev.slice(0, -1));
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const resetBoard = () => {
    setCells(Array(9).fill(""));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setMoveHistory([]);
    setTimer(0);
    setIsTimerRunning(false);
    setShowCelebration(false);
  };

  const resetAll = () => {
    resetBoard();
    setPlayerXScore(0);
    setPlayerOScore(0);
    setDrawScore(0);
    setGameHistory([]);
  };

  const getCellClassName = (index: number) => {
    let className = "relative aspect-square rounded-2xl text-4xl sm:text-5xl font-bold transition-all duration-300 ";
    
    if (winningLine?.includes(index)) {
      className += "bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-yellow-500/50 scale-105 shadow-lg shadow-yellow-500/20 ";
    } else if (cells[index]) {
      className += "bg-slate-800/50 border-slate-600/50 ";
    } else {
      className += "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50 hover:scale-105 ";
    }
    
    className += "border backdrop-blur-sm flex items-center justify-center cursor-pointer ";
    
    if (cells[index] === "X") {
      className += "text-blue-400";
    } else if (cells[index] === "O") {
      className += "text-purple-400";
    }

    return className;
  };

  const getCellSymbol = (value: string) => {
    if (value === "X") return "✕";
    if (value === "O") return "○";
    return "";
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
              initial={{ 
                // eslint-disable-next-line react-hooks/purity
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                // eslint-disable-next-line react-hooks/purity
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                // eslint-disable-next-line react-hooks/purity
                duration: 3 +  Math.random() * 2,
                repeat: Infinity,
                // eslint-disable-next-line react-hooks/purity
                delay: Math.random() * 2
              }}
            />
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-200 text-sm font-medium mb-4">
                <Gamepad2 className="w-4 h-4" />
                Classic Board Game
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Tic Tac Toe
              </h1>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Challenge your friends or test your skills against the AI!
              </p>
            </motion.div>

            {/* Game Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              <div className="flex gap-2 bg-slate-800/50 rounded-full p-1">
                <button
                  onClick={() => { setGameMode("pvp"); resetBoard(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    gameMode === "pvp"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  PvP
                </button>
                <button
                  onClick={() => { setGameMode("pve"); resetBoard(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    gameMode === "pve"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  vs AI
                </button>
              </div>

              {gameMode === "pve" && (
                <div className="flex gap-2 bg-slate-800/50 rounded-full p-1">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        difficulty === diff
                          ? "bg-orange-500 text-white shadow-lg"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Game Board */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl p-8"
              >
                {/* Game Status */}
                <div className="text-center mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={winner || currentPlayer}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      {winner ? (
                        <div className="space-y-2">
                          {winner === "Draw" ? (
                            <p className="text-2xl font-bold text-yellow-400">🤝 Its a Draw!</p>
                          ) : (
                            <>
                              <p className="text-2xl font-bold text-green-400">
                                🎉 {winner === "X" ? "Player X" : gameMode === "pvp" ? "Player O" : "AI"} Wins!
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-xl text-slate-300">
                          {isThinking ? (
                            <span className="flex items-center justify-center gap-2">
                              <Bot className="w-5 h-5 animate-pulse" />
                              AI is thinking...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Crown className="w-5 h-5" />
                              {currentPlayer === "X" ? "Player X" : gameMode === "pvp" ? "Player O" : "AI"}&apos;s Turn
                            </span>
                          )}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Board Grid */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {cells.map((value, index) => (
                    <motion.button
                      key={index}
                      onClick={() => updateBoard(index)}
                      disabled={!!value || !!winner || isThinking}
                      whileHover={!value && !winner && !isThinking ? { scale: 1.1 } : {}}
                      whileTap={!value && !winner && !isThinking ? { scale: 0.9 } : {}}
                      className={getCellClassName(index)}
                    >
                      <AnimatePresence>
                        {value && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            {getCellSymbol(value)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {!value && !winner && !isThinking && (
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-20 text-4xl transition-opacity">
                          {getCellSymbol(currentPlayer)}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={undoMove}
                    disabled={moveHistory.length === 0 || !!winner || isThinking}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetBoard}
                    className="flex items-center gap-2 px-6 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Game
                  </motion.button>
                </div>

                {/* Timer */}
                <div className="text-center mt-4">
                  <span className="inline-flex items-center gap-2 text-slate-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {formatTime(timer)}
                  </span>
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
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-slate-300">
                          {gameMode === "pvp" ? "Player X" : "You"}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-white">{playerXScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span className="text-slate-300">
                          {gameMode === "pvp" ? "Player O" : "AI"}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-white">{playerOScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-slate-300">Draws</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{drawScore}</span>
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
                      <span className="text-slate-400">Total Games</span>
                      <span className="text-lg font-bold text-white">
                        {playerXScore + playerOScore + drawScore}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-lg font-bold text-green-400">
                        {playerXScore + playerOScore + drawScore > 0
                          ? `${Math.round((playerXScore / (playerXScore + playerOScore + drawScore)) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mode</span>
                      <span className="text-lg font-bold text-purple-400">
                        {gameMode === "pvp" ? "2 Players" : `vs AI (${difficulty})`}
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
                      <Clock className="w-4 h-4" />
                      Recent Games
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {gameHistory.slice().reverse().map((game, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                            game.winner === "X" ? "bg-blue-500/10 text-blue-300" :
                            game.winner === "O" ? "bg-purple-500/10 text-purple-300" :
                            "bg-yellow-500/10 text-yellow-300"
                          }`}
                        >
                          <span>
                            {game.winner === "Draw" ? "Draw" : `${game.winner} wins`}
                          </span>
                          <span className="text-slate-400 text-xs">
                            {game.moves} moves
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={resetAll}
                      className="w-full mt-3 text-sm text-slate-400 hover:text-slate-300 transition"
                    >
                      Clear History
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-center"
              >
                <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                <p className="text-4xl font-bold text-white">Victory!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}