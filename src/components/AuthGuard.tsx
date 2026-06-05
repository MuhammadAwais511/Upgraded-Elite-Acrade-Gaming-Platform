"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-16 text-center text-slate-300">
        <div className="max-w-xl rounded-4xl border border-white/10 bg-slate-950/85 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-lg font-medium text-white">Checking your session...</p>
          <p className="mt-3 text-slate-400">Redirecting to sign in if required.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
