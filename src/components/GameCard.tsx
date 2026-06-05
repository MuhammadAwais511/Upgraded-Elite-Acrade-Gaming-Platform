"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  accent: string;
  thumb: string;
}

export default function GameCard({ title, description, href, accent, thumb }: GameCardProps) {
  return (
  
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group rounded border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-purple-500 to-fuchsia-500 text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
          {thumb}
        </div>
        <span className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
          {accent}
        </span>
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      <div className="mt-8 flex items-center justify-between gap-4">
        <Link
          href={href}
          className="inline-flex items-center rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          Play Now
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Live</span>
      </div>
    </motion.div>
  );
}
