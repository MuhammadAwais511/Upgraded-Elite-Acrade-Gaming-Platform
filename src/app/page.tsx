import Hero from "../components/Hero";
import GameCard from "../components/GameCard";

const featuredGames = [
  {
    title: "Guess The Number",
    description: "Strategic number challenges with hints, score tracking and a modern UI.",
    href: "/games/guess-number",
    accent: "Smart",
    thumb: "?",
  },
  {
    title: "Rock Paper Scissors",
    description: "Quick competitive rounds with live scoring, smooth animations and instant results.",
    href: "/games/rock-paper-scissors",
    accent: "Fast",
    thumb: "✊",
  },
  {
    title: "Tic Tac Toe",
    description: "A stylish two-player board game with draw detection and polished interactions.",
    href: "/games/tic-tac-toe",
    accent: "Classic",
    thumb: "✖️",
  },
];

const testimonials = [
  {
    quote: "The platform feels like a real gaming product with premium polish and fast interactions.",
    author: "Mia C.",
  },
  {
    quote: "I love the glassmorphism sections and animated details — it looks professional and fresh.",
    author: "Leo K.",
  },
  {
    quote: "The games are simple yet addictive, with a strong visual identity for a developer portfolio.",
    author: "Ava S.",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />

      <Hero />

      <section className="relative px-6 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-12">
          <section className="rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">Featured games</p>
                <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Play the latest challengers.</h2>
              </div>
              <p className="max-w-xl text-slate-300">
                Explore three immersive experiences designed for speed, strategy, and polished interaction.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredGames.map((game) => (
                <GameCard key={game.title} {...game} />
              ))}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.95fr_0.7fr]">
            <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">Why choose us</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">A premium gaming platform built for modern projects.</h2>
              <div className="mt-8 space-y-6 text-slate-300">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">Glassmorphism design</h3>
                  <p className="mt-2 text-slate-400">A sleek frosted interface that feels fresh and polished on every section.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">Animated experience</h3>
                  <p className="mt-2 text-slate-400">Framer Motion transitions make interactions feel fluid and engaging.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">Fully responsive</h3>
                  <p className="mt-2 text-slate-400">Designed to scale beautifully from mobile to large desktop displays.</p>
                </div>
              </div>
            </div>
            <div className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-950/80 to-slate-900/90 p-10 shadow-2xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Highlights</p>
              <ul className="mt-8 space-y-5 text-slate-300">
                <li className="rounded-3xl border border-white/10 bg-white/5 p-5">• Secure sign in page with validation.</li>
                <li className="rounded-3xl border border-white/10 bg-white/5 p-5">• Three playable games with unique mechanics.</li>
                <li className="rounded-3xl border border-white/10 bg-white/5 p-5">• Professional landing page and supporting pages.</li>
              </ul>
            </div>
          </section>

          <section className="rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                { label: "Players", value: "32.4k" },
                { label: "Games", value: "3 premium" },
                { label: "Uptime", value: "99.98%" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl bg-white/5 p-8 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                  <p className="mt-4 text-4xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">Testimonials</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">What players are saying</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {testimonials.map((item) => (
                  <div key={item.author} className="rounded-4xl border border-white/10 bg-white/5 p-6 text-slate-300 shadow-lg shadow-black/10">
                    <p className="text-lg leading-8">“{item.quote}”</p>
                    <p className="mt-6 text-sm font-semibold text-white">{item.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
