import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth'; // for DOCX
import pptx2json from 'pptx2json'; // for PPTX

const SUMMARY_FOLDER = path.join(process.cwd(), 'summary');
const SUMMARY_output = path.join(process.cwd(), 'summary_final');
const HISTORY_FILE = path.join(SUMMARY_output, 'history.json');
const MAX_CHUNK_WORDS = 2000;
const MAX_SUMMARY_TOKENS = 363;

// ✅ Helpers
function chunkText(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}

function cleanText(input: string): string {
  return input.replace(/[^\x20-\x7E\n\r]/g, '');
}

function runLlama(prompt: string): string {
  const result = spawnSync('ollama', ['run', 'mannix/phi3-mini-4k:latest'], {
    input: prompt,
    encoding: 'utf-8',
  });

  if (result.error) {
    throw new Error("❌ Failed to start Ollama: " + result.error.message);
  }

  if (result.status !== 0 || !result.stdout) {
    throw new Error(result.stderr || 'Ollama failed');
  }

  return result.stdout.trim();
}

// ✅ Detect file type from base64 header
function getFileExtension(base64: string): string {
  if (base64.startsWith('data:application/pdf')) return 'pdf';
  if (base64.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'docx';
  if (base64.startsWith('data:application/vnd.openxmlformats-officedocument.presentationml.presentation')) return 'pptx';
  if (base64.startsWith('data:text/plain')) return 'txt';
  return 'unknown';
}

// ✅ Extract text based on file type
async function extractText(fileBuffer: Buffer, ext: string): Promise<string> {
  if (ext === 'pdf') {
    const pdfData = await pdfParse(fileBuffer);
    return pdfData.text;
  } else if (ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else if (ext === 'pptx') {
    const slides = await pptx2json(fileBuffer);
    return slides.map((s: any) => s.text).join('\n');
  } else if (ext === 'txt') {
    return fileBuffer.toString('utf-8');
  }
  throw new Error('Unsupported file format.');
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '15mb' },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { file } = req.body;
  if (!file) return res.status(400).json({ error: 'No file provided.' });

  const ext = getFileExtension(file);
  if (ext === 'unknown') {
    return res.status(400).json({ error: 'Unsupported file format.' });
  }

  const fileBuffer = Buffer.from(file.split(',')[1], 'base64');
  const text = await extractText(fileBuffer, ext);

  if (!fs.existsSync(SUMMARY_FOLDER)) fs.mkdirSync(SUMMARY_FOLDER);
  if (!fs.existsSync(SUMMARY_output)) fs.mkdirSync(SUMMARY_output);

  // ✅ Split & summarize chunks
  const chunks = chunkText(text, MAX_CHUNK_WORDS);
  const summaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const prevSummaries = summaries.join('\n\n') || '';
    const prompt =
      i === 0
        ? `Summarize the following text in under ${MAX_SUMMARY_TOKENS} tokens:\n\n${chunks[i]}`
        : `Summarize the following text so it continues smoothly from the previous summary.\nPrevious summary:\n${prevSummaries}\n\nNew input:\n${chunks[i]}`;

    const summary = runLlama(prompt);
    summaries.push(summary);

    const filename = path.join(SUMMARY_FOLDER, `summary_${i + 1}.txt`);
    fs.writeFileSync(filename, summary);
  }

  // ✅ Final merge
  const finalText = summaries.join('\n\n');
  const finalPrompt = `
You are a summarizer AI. 
Below are multiple partial summaries that must be combined into one continuous summary. 
Reorganize them for readability and flow, ensuring no missing context.
⚠️ VERY IMPORTANT: Keep the final length equal to the total length of the combined summaries (~${finalText.split(/\s+/).length} words).
Do not shorten or over-extend. Maintain coherence and clarity.

Combined summaries:
${finalText}
`;

  let finalSummary = runLlama(finalPrompt);
  finalSummary = cleanText(finalSummary);

  // ✅ Save as PDF
  const timestamp = Date.now();
  const filename = `summary_${timestamp}.pdf`;
  const filePath = path.join(SUMMARY_output, filename);
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 16;
  const maxWidth = 500;

  let page = pdfDoc.addPage();
  let { height } = page.getSize();
  let y = height - 50;

  const words = finalSummary.split(' ');
  let line = '';
  for (const word of words) {
    const testLine = line + word + ' ';
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth > maxWidth) {
      page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
      line = word + ' ';

      if (y < 50) {
        page = pdfDoc.addPage();
        y = page.getHeight() - 50;
      }
    } else {
      line = testLine;
    }
  }
  if (line) page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  // ✅ Update history
  const entry = { filename, createdAt: new Date().toISOString(), summary: finalSummary };
  let history: any[] = [];
  if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  }
  history.unshift(entry);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

  res.status(200).json({
    summary: finalSummary,
    downloadUrl: `/api/download-summary?file=${filename}`,
  });

  // ✅ Cleanup temp chunks
  if (fs.existsSync(SUMMARY_FOLDER)) {
    fs.readdirSync(SUMMARY_FOLDER).forEach(f => {
      fs.unlinkSync(path.join(SUMMARY_FOLDER, f));
    });
  }
}