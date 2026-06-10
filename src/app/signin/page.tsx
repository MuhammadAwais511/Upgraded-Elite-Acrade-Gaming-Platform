"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/games");
    }
  }, [status, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password."
          : "Unable to sign in.",
      );
    }

    setSuccess("Signed in successfully. Redirecting to games...");
    router.push("/games");
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/games" });
  };

  return (
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-20 sm:px-8">
      <div className="relative max-w-3xl rounded-4xl border border-white/10 bg-slate-950/90 p-10 shadow-2xl shadow-black/30 backdrop-blur-3xl">
        <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">
              Secure sign in
            </p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Access the Elite Arcade suite.
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
              Sign in with a real account or use Google to access the games and
              preserve security.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                placeholder="Enter your password"
                type="password"
              />
            </div>
            {error && (
              <p className="rounded-3xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </p>
            )}
            <button
              disabled={loading}
              className="w-full rounded-3xl bg-linear-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full rounded-3xl border border-white/10 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:border-purple-500 hover:bg-slate-800"
          >
            Continue with Google
          </button>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Need an account?</p>
            <p>
              <a
                href="/signup"
                className="text-purple-300 hover:text-purple-200"
              >
                Create one now
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
