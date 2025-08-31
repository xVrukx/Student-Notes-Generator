import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

const SUMMARY_OUTPUT = path.join(process.cwd(), 'summary_final')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query
  const filename = typeof file === 'string' ? file : 'summary.pdf'
  const filePath = path.join(SUMMARY_OUTPUT, filename)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Summary PDF not found.' })
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  const fileStream = fs.createReadStream(filePath)
  fileStream.pipe(res)
}