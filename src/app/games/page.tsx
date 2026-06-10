"use client";

import AuthGuard from "../../components/AuthGuard";
import GameCard from "../../components/GameCard";
import { motion } from "framer-motion";

const games = [
  {
    title: "Guess The Number",
    description: "Test your intuition with a dynamic number challenge and real-time hints.",
    href: "/games/guess-number",
    accent: "Strategy",
    thumb: "🎯",
  },
  {
    title: "Rock Paper Scissors",
    description: "Face off against the system in a fast-paced classic with scoreboard momentum.",
    href: "/games/rock-paper-scissors",
    accent: "Arcade",
    thumb: "✊",
  },
  {
    title: "Tic Tac Toe",
    description: "A polished two-player board game with winner detection and pro-level design.",
    href: "/games/tic-tac-toe",
    accent: "Classic",
    thumb: "✖️",
  },
  {
    title: "Word Weaver",
    description: "Test your vocabulary by guessing hidden words with helpful hints and sound effects.",
    href: "/games/word-weaver",
    accent: "Wordy",
    thumb: "📝",
  },
  {
    title: "Color Cascade",
    description: "Race against time matching colors in this addictive Stroop effect challenge.",
    href: "/games/color-cascade",
    accent: "Vibrant",
    thumb: "🎨",
  },
  {
    title: "Memory Matrix",
    description: "Train your brain by memorizing and recalling complex patterns under pressure.",
    href: "/games/memory-matrix",
    accent: "Brainy",
    thumb: "🧠",
  },
];

export default function GamesPage() {
  return (
    <AuthGuard>
      <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
        
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <h1 className="text-4xl font-semibold text-white sm:text-5xl bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Games Arena
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Choose your challenge, level up your score, and enjoy six premium games built with modern UI and polished interactions.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">6 Games</span>
              <span className="px-3 py-1 text-xs rounded-full bg-pink-500/20 text-pink-300">Free to Play</span>
              <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">No Downloads</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {games.map((game, index) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <GameCard {...game} />
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 rounded-4xl border border-white/10 bg-slate-950/60 p-8 backdrop-blur-xl text-center"
          >
            <p className="text-slate-400">🎮 More games coming soon! Stay tuned for updates.</p>
          </motion.div>
        </div>
      </section>
    </AuthGuard>
  );
}