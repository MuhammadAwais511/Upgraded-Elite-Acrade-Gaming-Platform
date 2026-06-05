"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    // Fake submission - just show success message
    setTimeout(() => {
      setSuccess("Message sent successfully! We will reply soon!");
      setName("");
      setEmail("");
      setMessage("");
      setSubmitting(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white">Reach out to the Elite Arcade team</h2>
        <p className="text-slate-400">Ask about the platform, collaborations, or future game ideas.</p>
      </div>

      {success ? (
        <div className="rounded-3xl border border-green-500/30 bg-green-500/10 px-6 py-4 text-green-300 shadow-lg">
          ✓ {success}
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="Your name"
                disabled={submitting}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span>Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="you@example.com"
                type="email"
                disabled={submitting}
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Message</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-40 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none transition focus:border-purple-500"
              placeholder="Tell us what you need."
              disabled={submitting}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-3xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </>
      )}
    </form>
  );
}
