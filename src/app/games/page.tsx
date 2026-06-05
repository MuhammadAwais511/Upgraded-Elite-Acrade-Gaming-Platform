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
    thumb: "?",
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
];

export default function GamesPage() {
  return (
    <AuthGuard>
      <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Games Arena</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Choose your challenge, level up your score, and enjoy three premium games built with modern UI and polished interactions.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {games.map((game) => (
              <GameCard key={game.title} {...game} />
            ))}
          </motion.div>
        </div>
      </section>
    </AuthGuard>
  );
}
