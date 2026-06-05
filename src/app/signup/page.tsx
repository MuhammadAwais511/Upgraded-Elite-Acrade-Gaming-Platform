"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setStatus({ type: "error", message: "Please fill all fields." });
      return;
    }

    if (name.trim().length < 3) {
      setStatus({ type: "error", message: "Name must be at least 3 characters." });
      return;
    }

    if (!emailPattern.test(email)) {
      setStatus({ type: "error", message: "Enter a valid email address." });
      return;
    }

    if (password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });

    const result = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error || "Unable to create account." });
      return;
    }

    setStatus({ type: "success", message: "Account created successfully. Redirecting to sign in..." });
    setTimeout(() => router.push("/signin"), 1200);
  };

  return (
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-20 sm:px-8">
      <div className="relative max-w-3xl rounded-4xl border border-white/10 bg-slate-950/90 p-10 shadow-2xl shadow-black/30 backdrop-blur-3xl">
        <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">Secure sign up</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Create your Elite Arcade account.</h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
              Sign up with a real email and password, then access the games with a stronger authentication flow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Full Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="Minimum 8 characters"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Confirm Password</label>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="Repeat your password"
                type="password"
              />
            </div>
            {status && (
              <p
                className={`rounded-3xl px-4 py-3 text-sm ${
                  status.type === "error" ? "bg-red-500/10 text-red-200" : "bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {status.message}
              </p>
            )}
            <button
              disabled={submitting}
              className="w-full rounded-3xl bg-linear-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Already registered?</p>
            <p>
              <a href="/signin" className="text-purple-300 hover:text-purple-200">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
