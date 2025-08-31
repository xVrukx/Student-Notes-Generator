import './globals.css'
import Link from 'next/link'
import { ReactNode } from 'react'
import Sidebar from '@/components/ui/sidebar'

export const metadata = {
  title: 'Student Notes Summarizer',
  description: 'Summarize PDF notes and ask summary-related questions',
    icons: {
    icon: '/study.ico'}
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          🧠 Student Notes Generator
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="https://github.com/xVrukx/Student-Notes-Generator/" className="hover:underline">Git repo</Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Student Notes Generator</span>
        <span className="hidden sm:block">Summarize long notes to understand better</span>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-gray-900 min-h-screen font-sans">
        <div className="min-h-screen flex flex-col">
          <Navbar />

          {/* Shell: Sidebar (1/4) + Main (3/4) */}
          <div className="flex-1 flex min-h-0">
            {/* Sidebar */}
            <aside className="w-1/4 min-w-[260px] bg-slate-900 text-white flex flex-col">
              <div className="p-4 border-b border-slate-800">
                <h2 className="text-xl font-bold">📥 Downloads</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Recent summary notes & PDFs
                </p>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <Sidebar/>
              </nav>
              <div className="mt-auto p-4 text-xs text-slate-400 border-t border-slate-800">
                Tip: Upload a PDF to generate new summary notes.
              </div>
            </aside>
            <main className="w-3/4 min-w-0 overflow-y-auto">
              <div className="p-[10%] min-h-full">
                {children}
              </div>
            </main>
          </div>

          <Footer />
        </div>
      </body>
    </html>
  )
}
