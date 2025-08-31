import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

const SUMMARY_OUTPUT = path.join(process.cwd(), 'summary_final')
const HISTORY_FILE = path.join(SUMMARY_OUTPUT, 'history.json')

// 🔹 Reuse llama runner
function runLlama(prompt: string): string {
  const result = spawnSync('ollama', ['run', 'mannix/phi3-mini-4k:latest'], {input: prompt, encoding: 'utf-8',
  });

  if (result.error) throw new Error("❌ Failed to start process: " + result.error.message)
  if (result.status !== 0 || !result.stdout) throw new Error(result.stderr || 'ollama failed')

  return result.stdout.trim()
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { question, summaryName } = req.body
  if (!question) return res.status(400).json({ error: 'No question provided.' })

  if (!fs.existsSync(HISTORY_FILE)) {
    return res.status(404).json({ error: 'No summaries available yet.' })
  }

  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'))

  // pick summary (specific one or latest)
  let targetSummary = null
  if (summaryName) {
    targetSummary = history.find((h: any) => h.filename === summaryName)
  }
  if (!targetSummary && history.length > 0) {
    targetSummary = history[0]
  }

  if (!targetSummary) {
    return res.status(404).json({ error: 'No summary found.' })
  }

  // 🔹 Construct a Q&A prompt for the model
  const prompt = `
You are an assistant answering questions based on a given summary.
Summary:
${targetSummary.summary}

Question:
${question}

Answer clearly and concisely based only on the summary above.
`

  let answer: string
  try {
    answer = runLlama(prompt)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }

  res.status(200).json({
    question,
    answer,
    relatedSummary: targetSummary.filename,
  })
}
