import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Providers } from "./providers";

export const metadata = {
  title: "Elite Arcade | Gaming Platform",
  description: "Premium gaming platform built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}