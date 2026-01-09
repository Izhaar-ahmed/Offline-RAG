# Offline RAG System - v2.0 Setup Guide

This system has been updated with **RBAC (Secure Login)** and **20-Page Blocking** (Improved Retrieval).
Follow these steps to run the updated system.

## 1. Reset Data (Critical for New Blocking Logic)
Because the indexing strategy changed from "1 Doc = 1 Block" to "20 Pages = 1 Block", you **must** clear old indexes.

Run this in your terminal:
```bash
# Remove all old index files
rm -rf backend/models/indexes
rm backend/models/block_index.bin
rm backend/models/block_metadata.npy
```

## 2. Start the Backend
The backend now includes Authentication logic.

```bash
# In /Users/bilal/offline-rag
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## 3. Start the Frontend
The frontend now includes a Login Page.

```bash
# In /Users/bilal/offline-rag/frontend
npm run dev
```

## 4. Using the System

### Access
- Go to [http://localhost:3000](http://localhost:3000).
- You will see the "Read Only" view initially.

### Login (Admin)
- Click the **Login** button in the sidebar.
- **Username**: `admin`
- **Password**: `admin`
- You will now see "ADMIN CONSOLE" in the sidebar.

### Uploading Documents
- Only as **Admin**, you can now drag & drop files.
- Try uploading a large PDF (e.g., 50+ pages).
- The system will automatically split it into 20-page blocks (e.g., Block 0: Pages 1-20, Block 1: 21-40...).

### Searching
- You can now search for specific details.
- The system will find the most relevant **20-page block** first, then find the specific answer.
- Citations will still point to the exact page number.

## 5. Troubleshooting
- **"Admin access required"**: Make sure you logged in.
- **"No such file" (models)**: If you accidentally deleted `backend/models`, run `python backend/setup_models.py`.
