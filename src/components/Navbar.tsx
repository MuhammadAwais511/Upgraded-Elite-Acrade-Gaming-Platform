"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Games", href: "/games" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { data: session, status } = useSession();

  const userName = useMemo(() => {
    if (status !== "authenticated") return "";
    return session?.user?.name || session?.user?.email || "";
  }, [session, status]);

  const handleSignOut = async () => {
    // ❌ removed router.push (causes redirect/re-render issues)
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl shadow-black/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-linear-to-br from-purple-500 to-fuchsia-500 text-lg font-bold shadow-lg shadow-purple-500/20">
            G
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300/80">
              GameHub
            </p>
            <p className="font-semibold text-white">Elite Arcade</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                pathname === item.href
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden items-center gap-4 md:flex">
          {userName ? (
            <>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 backdrop-blur-md">
                {userName}
              </div>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-700/70 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-200 md:hidden"
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 px-6 py-5 md:hidden">
          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-2xl px-4 py-3 transition ${
                  pathname === item.href
                    ? "bg-white/5 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3">
            {userName ? (
              <button
                onClick={handleSignOut}
                className="rounded-2xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-purple-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}