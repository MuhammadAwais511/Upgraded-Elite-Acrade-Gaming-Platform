"use client";

import { motion } from "framer-motion";

const skills = ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Responsive UI", "Glassmorphism"];

export default function AboutPage() {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="grid gap-12 lg:grid-cols-[0.9fr_0.7fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">About Elite Arcade</p>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">A premium gaming hub built for modern experiences.</h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                I am a developer who values polished visual design, intuitive interactions, and immersive experiences. This platform is crafted as a professional portfolio-grade project with a gaming-first aesthetic.
              </p>
            </div>
            <div className="rounded-4xl border border-white/10 bg-linear-to-br from-white/5 to-slate-900/80 p-8 shadow-inner shadow-black/30">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Mission</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Deliver unforgettable gameplay anywhere.</h2>
              <p className="mt-4 text-slate-300">
                We focus on game accessibility, modern UI systems, and meaningful interactions so every visitor feels engaged from first load to final victory.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Professional layout</p>
              <p className="mt-4 text-slate-300">The design uses premium spacing, modern typography, and glassmorphism to feel polished and production-ready.</p>
            </div>
            <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Performance</p>
              <p className="mt-4 text-slate-300">Built with Next.js App Router and optimized animations to keep the UI fast and fluid on desktop and mobile.</p>
            </div>
            <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Focus</p>
              <p className="mt-4 text-slate-300">Strong emphasis on conversion-focused sections, trust-building testimonials, and clear calls to action.</p>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <div key={skill} className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-slate-200 shadow-sm shadow-black/10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{skill}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-4xl border border-white/10 bg-slate-950/90 p-8 text-slate-300 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">What makes Elite Arcade different?</h2>
            <ul className="mt-6 space-y-4 text-slate-400">
              <li>• Secure sign in flow with modern glassmorphism styling.</li>
              <li>• Fully responsive games and platform pages for mobile and desktop.</li>
              <li>• Premium animations powered by Framer Motion.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
