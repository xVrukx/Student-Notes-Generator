'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Send, Download } from 'lucide-react'

export default function Home() {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [chat, setChat] = useState<string[]>([])
  const [downloadUrl, setDownloadUrl] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const base64 = await toBase64(file)

    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: base64 }),
    })

    const data = await res.json()
    setSummary(data.summary || '')
    setDownloadUrl(data.downloadUrl || '')
    setChat([])
    setLoading(false)
  }

  const askBot = async () => {
    if (!question.trim()) return

    const res = await fetch('/api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, summaryName: downloadUrl.split('=')[1] }) // pass summary filename
    })
    const data = await res.json()

    setChat(prev => [...prev, `👤 ${question}`, `🤖 ${data.answer}`])
    setQuestion('')
  }


  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })

  return (
    <Card className="relative flex h-[calc(100vh-160px)] w-full flex-col rounded-2xl shadow-xl">
      <div className="border-b p-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">📝 Generated notes</h3>
          <p className="text-xs text-slate-500">
            Upload a PDF or then ask questions about the generated summary below.
          </p>
        </div>

        <label className="upload-zone w-auto border-slate-300 !p-2">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-slate-600" />
            <span className="text-sm text-slate-700">Upload PDF</span>
          </div>
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        {/* Summary Box (big rounded box) */}
        <div className="summary-box flex-1">
          <Textarea
            value={
              loading
                ? '⏳ Summarizing notes...'
                : summary || 'Upload a file to generate summary.'
            }
            readOnly
            className="summary-box h-full w-full resize-none"
          />
        </div>

        {/* Mini chat transcript area (optional; shows Q/A above input bar) */}
        {chat.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
            {chat.map((line, i) => (
              <p key={i} className={line.startsWith('👤') ? 'chat-user' : 'chat-bot'}>
                {line}
              </p>
            ))}
          </div>
        )}
      </CardContent>

      {/* Bottom Input Bar (download left, input center, send right) */}
      <div className="sticky bottom-0 w-full border-t bg-white p-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" disabled={!downloadUrl}>
            <a href={downloadUrl || '#'} download>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </Button>

          <Input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask something about the summary notes..."
            className="flex-1"
          />

          <Button onClick={askBot}>
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </Card>
  )
}
