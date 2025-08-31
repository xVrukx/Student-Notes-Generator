'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SummaryEntry {
  filename: string
  createdAt: string
}

export default function Sidebar() {
  const [history, setHistory] = useState<SummaryEntry[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history')
        const data = await res.json()
        setHistory(data)
      } catch (err) {
        console.error('Failed to load history:', err)
      }
    }
    fetchHistory()
  }, [])

  if (history.length === 0) {
    return <p className="text-xs text-slate-400">No summaries yet.</p>
  }

  return (
    <>
      {history.map((item, idx) => (
        <Link
          key={item.filename}
          href={`/api/download-summary?file=${encodeURIComponent(item.filename)}`}
          className={`sidebar-link ${idx === 0 ? 'bg-slate-700 font-semibold' : ''}`}
        >
          {idx === 0 ? 'Latest: ' : ''}
          {item.filename}
        </Link>
      ))}
    </>
  )
}
