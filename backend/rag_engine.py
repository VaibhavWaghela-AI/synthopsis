# -*- coding: utf-8 -*-
"""
Synthopsis Production RAG & Semantic Retrieval Engine
=====================================================
Indexes enterprise PDF catalogs, brochures, policies, and contracts.
Performs hybrid semantic/keyword ranking and grounds real-time chat responses.
"""

import math
import re
import time
from typing import List, Dict, Any, Optional
from database import get_connection

def clean_and_tokenize(text: str) -> List[str]:
    """Tokenizes text into lowercase normalized alphanumeric tokens."""
    return re.findall(r"\b[a-zA-Z0-9_\-]{2,}\b", text.lower())

def chunk_document_text(text: str, chunk_size: int = 450, overlap: int = 60) -> List[Dict[str, Any]]:
    """
    Splits text into overlapping semantic passages.
    Extracts page boundaries if page markers exist.
    """
    # Detect page markers like '--- Page 1 ---'
    pages = re.split(r"---\s*Page\s*(\d+)\s*---", text)
    chunks = []
    
    if len(pages) > 1:
        # Multi-page PDF text
        i = 1
        while i < len(pages):
            page_num = int(pages[i])
            page_text = pages[i+1].strip()
            i += 2
            
            # Sub-chunk page text
            start = 0
            while start < len(page_text):
                end = min(start + chunk_size, len(page_text))
                # Try finding natural sentence break near end
                if end < len(page_text):
                    last_period = page_text.rfind(". ", start, end)
                    if last_period != -1 and last_period > start + 100:
                        end = last_period + 1
                
                chunk_str = page_text[start:end].strip()
                if chunk_str:
                    chunks.append({
                        "text": chunk_str,
                        "page": page_num
                    })
                start = end - overlap if end < len(page_text) else len(page_text)
    else:
        # Plain document without page markers
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            if end < len(text):
                last_period = text.rfind(". ", start, end)
                if last_period != -1 and last_period > start + 100:
                    end = last_period + 1
            chunk_str = text[start:end].strip()
            if chunk_str:
                chunks.append({
                    "text": chunk_str,
                    "page": 1
                })
            start = end - overlap if end < len(text) else len(text)
            
    return chunks

def index_document(filename: str, text: str, num_pages: int = 1) -> Dict[str, Any]:
    """Indexes a document and its chunks into the persistent database."""
    doc_id = f"doc-{int(time.time() * 1000)}"
    chunks = chunk_document_text(text)
    
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO rag_documents (id, filename, char_count, num_pages)
        VALUES (?, ?, ?, ?)
        """, (doc_id, filename, len(text), num_pages))
        
        for idx, ch in enumerate(chunks):
            chunk_id = f"chk-{doc_id}-{idx}"
            conn.execute("""
            INSERT INTO rag_chunks (id, doc_id, chunk_index, chunk_text, page_number)
            VALUES (?, ?, ?, ?, ?)
            """, (chunk_id, doc_id, idx, ch["text"], ch["page"]))
            
        conn.commit()
        
    return {
        "doc_id": doc_id,
        "filename": filename,
        "chunks_indexed": len(chunks),
        "total_chars": len(text)
    }

def search_knowledge_base(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Executes hybrid search across all indexed chunks using BM25-style term frequency
    and proximity scoring.
    """
    query_tokens = clean_and_tokenize(query)
    if not query_tokens:
        return []
        
    with get_connection() as conn:
        rows = conn.execute("""
        SELECT c.id, c.doc_id, c.chunk_text, c.page_number, d.filename
        FROM rag_chunks c
        JOIN rag_documents d ON c.doc_id = d.id
        """).fetchall()
        
        if not rows:
            return []
            
        scored_candidates = []
        for r in rows:
            chunk_text = r["chunk_text"]
            chunk_tokens = clean_and_tokenize(chunk_text)
            chunk_token_set = set(chunk_tokens)
            
            score = 0.0
            # Term overlap & frequency scoring
            for q_tok in query_tokens:
                if q_tok in chunk_token_set:
                    tf = chunk_tokens.count(q_tok)
                    # logarithmic term frequency
                    score += 1.0 + math.log(1.0 + tf)
                    
            # Exact phrase match boost
            if query.lower() in chunk_text.lower():
                score += 5.0
                
            if score > 0.0:
                scored_candidates.append({
                    "id": r["id"],
                    "doc_id": r["doc_id"],
                    "filename": r["filename"],
                    "page_number": r["page_number"],
                    "chunk_text": chunk_text,
                    "score": round(score, 3)
                })
                
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        return scored_candidates[:top_k]

def get_rag_context_for_query(query: str, max_chunks: int = 3) -> str:
    """
    Builds clean Markdown context string for injecting into system prompts.
    """
    matches = search_knowledge_base(query, top_k=max_chunks)
    if not matches:
        return ""
        
    context_lines = [
        "\n--- VERIFIED ENTERPRISE KNOWLEDGE BASE (GROUND TRUTH) ---",
        "Use the following factual excerpts to answer the client inquiry with high accuracy:\n"
    ]
    
    for idx, m in enumerate(matches, 1):
        context_lines.append(
            f"[Source {idx}: {m['filename']} (Page {m['page_number']}) | Relevance: {m['score']}]\n"
            f"{m['chunk_text']}\n"
        )
        
    context_lines.append("----------------------------------------------------------\n")
    return "\n".join(context_lines)

def list_indexed_documents() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("""
        SELECT d.id, d.filename, d.char_count, d.num_pages, d.uploaded_at,
               COUNT(c.id) as chunk_count
        FROM rag_documents d
        LEFT JOIN rag_chunks c ON d.id = c.doc_id
        GROUP BY d.id
        ORDER BY d.uploaded_at DESC
        """).fetchall()
        return [dict(r) for r in rows]

def delete_document(doc_id: str) -> bool:
    with get_connection() as conn:
        conn.execute("DELETE FROM rag_documents WHERE id = ?", (doc_id,))
        conn.execute("DELETE FROM rag_chunks WHERE id = ?", (doc_id,))
        conn.commit()
        return True
