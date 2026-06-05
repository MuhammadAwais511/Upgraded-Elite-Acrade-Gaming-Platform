import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Games", href: "/games" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90 px-6 py-10 text-slate-400 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-linear-to-br from-purple-500 to-fuchsia-500 text-lg font-bold shadow-lg shadow-purple-500/20">
              G
            </div>
            <div>
              <p className="font-semibold">Elite Arcade</p>
              <p className="text-sm text-slate-400">Premium gaming experience for modern players.</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400">
            Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion for a polished portfolio-ready platform.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Navigation</p>
            <div className="flex flex-col gap-2 text-sm">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Contact</p>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Email: awaisdeveloper763@gmail.com</p>
              <p>Github : https://github.com/MuhammadAwais511</p>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Social</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="https://github.com/MuhammadAwais511" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:text-white">
                Github
              </Link>
              <Link href="https://www.linkedin.com/in/awais-developer-683489372/" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:text-white">
                Linkedin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Elite Arcade. Crafted by a modern game UI developer.
      </div>
    </footer>
  );
}
