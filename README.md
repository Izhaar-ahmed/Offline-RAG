# Offline RAG System

A privacy-first, fully offline Retrieval-Augmented Generation system.

## 🌟 Key Features
- **100% Offline & Private**: Zero internet required. Your data never leaves your device.
- **Smart Document Search**: detailed semantic search using local vector embeddings (FAISS).
- **Multi-Format Support**: Drag & Drop PDF, DOCX, and TXT files.
- **AI-Powered Q&A**: Generates answers using a quantized local LLM (Phi-3 Mini).
- **Transparent Citations**: Every answer links back to the exact source document and page number.
- **Premium UI**: Modern, responsive dark-mode interface built with Next.js and Tailwind CSS.
- **Incremental Indexing**: Upload new files anytime without rebuilding the entire database.

## Setup

1. **Install Backend Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Download Models (One-time, requires Internet)**:
   ```bash
   python backend/setup_models.py
   ```
   This downloads:
   - `sentence-transformers/all-MiniLM-L6-v2` (Embeddings)
   - `Phi-3-mini-4k-instruct-Q4_K_M.gguf` (LLM)

3. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

## Running the System

1. **Start Backend**:
   ```bash
   # From project root
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend**:
   ```bash
   # From frontend directory
   cd frontend
   npm run dev
   ```

3. **Usage**:
   - Open [http://localhost:3000](http://localhost:3000).
   - Upload PDF, DOCX, or TXT files.
   - Chat with your documents completely offline!
## Notes
- Ensure you have ~5-6GB of free RAM.
- GGUF models run on CPU.
