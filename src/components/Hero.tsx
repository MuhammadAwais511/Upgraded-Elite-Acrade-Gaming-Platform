"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_45%)]" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
              <span className="rounded-full bg-purple-500 px-2 py-1 text-xs uppercase tracking-[0.3em] text-white">New</span>
              Premium gaming platform launch.
            </div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Discover the ultimate <span className="bg-linear-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">gaming universe</span>.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                Elite Arcade brings immersive browser games, pro-level interactions, and polished animations in a modern, secure experience designed for gamers and portfolios.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/games" className="inline-flex items-center rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                Explore Games
              </Link>
              <Link href="/signin" className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20">
                Sign In Securely
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/50"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-500 to-pink-500" />
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-3xl bg-white/5 p-4 text-slate-200 shadow-inner shadow-black/10">
                <div>
                  <p className="text-sm text-slate-400">Weekly players</p>
                  <p className="text-2xl font-semibold text-white">34.8K</p>
                </div>
                <div className="rounded-3xl bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200">+18%</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Featured Arena</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Nightfall Rift</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Top Winner</p>
                  <p className="mt-4 text-3xl font-semibold text-white">ShadowStrike</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
