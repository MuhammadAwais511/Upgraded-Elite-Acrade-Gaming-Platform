import ContactForm from "../../components/ContactForm";

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_0.9fr] lg:items-start">
          <div className="space-y-6 rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">Contact</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Lets build your next gaming moment.</h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Use the form to reach out for project inquiries, portfolio reviews, or collaboration conversations. Fast responses with a professional tone.
            </p>
            <div className="space-y-4 text-slate-400">
              <p className="font-medium text-white">Elite Arcade Support</p>
              <p>Email: support@elitearcade.gg</p>
              <p>Discord: elite-arcade#3781</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
