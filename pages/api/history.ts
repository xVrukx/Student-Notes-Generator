import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

const SUMMARY_OUTPUT = path.join(process.cwd(), 'summary_final')
const HISTORY_FILE = path.join(SUMMARY_OUTPUT, 'history.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!fs.existsSync(HISTORY_FILE)) {
    return res.status(200).json([])
  }
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'))
  res.status(200).json(history)
}