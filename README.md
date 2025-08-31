📚 Study Notes Generator (ChainSummary)

Summarizes PDFs, Textbooks, and Slides into Clear Notes

Developed by: Yuvraj D Sirganor
Powered by: PCS (Progressive Context Summarization)
Tech Stack: Next.js + TypeScript + Tailwind CSS + Ollama (local LLMs)

🚀 Project Overview

Name: Study Notes Generator (ChainSummary)
One-liner: Upload long PDFs, textbooks, or slides → get structured notes instantly. Saves hours of manual work. Built using PCS, a custom AI summarization pipeline designed for scalability and coherence.

✅ Key Features

✔ Multi-format input: PDF, DOC, PPT, TXT, raw text.

✔ Interactive Q&A: Ask questions about any summary.

✔ Smart Pipeline: Chunking → Contextual Summarization → Chained Linking → Final Merge.

✔ Traceability: Intermediate outputs (Part1.txt, Part2.txt, …) for debugging.

✔ Scales up: Handles 30,000+ words with chunking + progressive compression.

✔ Model-Agnostic: Works with local or cloud LLMs (GPT-family, Phi-3-mini-4K, LLaMA).

✔ Simple UX: Upload → Auto Summarization → Download Notes.

🔍 Why This Approach Works

✅ Works across all text-capable models.

✅ Produces better readability than hierarchical summarization.

✅ Handles irregular document structures (missing headings, multiple formats).

✅ Maintains context awareness throughout chunks.

⚠ Limitations

More chunking for small-token models.

Minor detail loss during multi-stage compression.

Early errors can propagate forward.

Dependent on input quality.

📊 Practical Chunking & Accuracy (Estimates)
Document Size	Chunks	Accuracy
1,000–2,000	1	~95%
2,001–6,000	3	~88–90%
6,001–12,000	6	~82–85%
12,001–15,000	8	~78–80%
15,001–20,000	10	~72–75%
20,001–30,000	15	~68–70%

(Based on Phi-3-mini-4K; larger models improve performance.)

🛠 How It Works

Upload file (.pdf, .docx, .pptx, .txt).

Extract text → split into chunks (2,000 words default).

Summarize chunks with contextual linking.

Apply progressive compression after every N chunks.

Merge into Final_Summary.txt, then refine for readability.

Use Explanation Chat to clarify summaries.

🔬 PCS (Progressive Context Summarization)

PCS ensures continuity and scalability for large documents:
✔ Sequential chunking with context linking.
✔ Progressive compression to reduce token usage.
✔ Outputs connected summaries that feel like one structured document.

Why PCS > Other Methods
Method	Weakness
Map-Reduce (LangChain)	Loses continuity
Hierarchical (SUMMA)	Tree-based & complex
EduFuncSum (2025)	Built for code
Progressive Summarization	Manual process

PCS solves these with:
✔ File-backed chain approach (PartN.txt) for traceability.
✔ Explicit linking prompts between chunks.
✔ Progressive compression for handling 30k+ words.

📚 References

Christensen et al., Hierarchical Summarization (ACL 2014)

LangChain — Map-Reduce Summarization Docs

Rong et al., EduFuncSum: Progressive Transformer for Code (J. King Saud Univ., 2025)

Forte Labs — Progressive Summarization Technique

🖥 Tech Stack

Framework: Next.js
 (with TypeScript)

Styling: Tailwind CSS

LLM Backend: Ollama

Model used: Phi-3-mini-4K or any compatible GGUF model

Algorithm: PCS (custom summarization pipeline)

⚙ Installation & Setup
Prerequisites

Node.js (>=18)

Ollama installed locally

Steps
# Clone repo
git clone https://github.com/your-username/student-notes-generator.git
cd student-notes-generator

# Install dependencies
npm install

# Start the development server
npm run dev


Open http://localhost:3000
 in your browser.

🧠 How to Run Ollama with Your Model

Download Phi-3-mini-4K (or your preferred model):

ollama pull phi-3-mini-4k


Update ollama-model.txt in the root directory:

./ollama run phi-3-mini-4k


The app uses this file to call your model via CLI.

✅ Features in UI

Upload PDF, DOC, PPT, or TXT

Real-time progress tracking

Download final summary as PDF

Sidebar for downloaded summaries

Built with Tailwind CSS for responsive design

🏆 Why It’s Useful for Students

Saves hours of note-making

Handles textbooks, lecture slides, and research papers

Summarized content is clear, structured, and easy to study

🔗 Future Improvements

✅ Flashcard generation

✅ Quiz generator

✅ Real-time streaming summaries

✅ Dark mode UI

🔥 Hackathon Submission | Built by Yuvraj D Sirganor
📌 Powered by PCS and Ollama LLMs
🚀 Summarize your knowledge, don’t waste time reading everything!
