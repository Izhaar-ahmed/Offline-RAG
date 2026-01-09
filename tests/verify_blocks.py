import sys
import os
import shutil

# Add project root to path
sys.path.append(os.getcwd())

def test_blocking_logic():
    print("\nTesting 20-Page Blocking Logic...")
    
    try:
        from backend.rag_engine import RAGEngine
    except ImportError as e:
        print(f"  SKIP: RAG dependencies missing ({e}). Cannot run full test.")
        return

    test_dir = "test_models_blocking"
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir)
        
    engine = RAGEngine(models_dir=test_dir)
    
    # Mock embedding
    class MockEmbed:
        def encode(self, texts):
            import numpy as np
            # Return shape (N, 384)
            return np.random.rand(len(texts), 384).astype("float32")
            
    engine.embedding_model = MockEmbed()
    
    # Create Dummy Chunks spanning 50 pages
    # Block 1: 1-20
    # Block 2: 21-40
    # Block 3: 41-50
    chunks = []
    for p in range(1, 51):
        chunks.append({"text": f"Content on page {p}", "page": p})
        
    # Add Document
    doc_id = "doc_test_blocking"
    engine.add_document(doc_id, "large_manual.pdf", chunks)
    
    # Verify Global Block Index
    # Should have 3 blocks
    assert engine.block_index.ntotal == 3
    print(f"  REL: Created {engine.block_index.ntotal} blocks (Expected 3)")
    
    # Verify Metadata
    assert len(engine.block_metadata) == 3
    print("  REL: Metadata count matches")
    
    b1 = engine.block_metadata[0]
    b2 = engine.block_metadata[1]
    b3 = engine.block_metadata[2]
    
    print(f"  Block 1 Range: {b1['page_range']} (Expected 1-20)")
    print(f"  Block 2 Range: {b2['page_range']} (Expected 21-40)")
    print(f"  Block 3 Range: {b3['page_range']} (Expected 41-60 or 41-50 essentially)")
    
    assert b1['page_range'] == "1-20"
    assert b2['page_range'] == "21-40"
    
    # Verify Chunk Indexes
    # We should have 3 chunk indexes
    assert len(engine.chunk_indexes) == 3
    print(f"  REL: Chunk indexes count {len(engine.chunk_indexes)} (Expected 3)")
    
    # Verify Search Routing
    # Searching for "page 45" should theoretically route to Block 3 ?
    # With random embeddings, we can't guarantee L2 distance routing unless we mock embeddings smarter.
    # But we can verify that `search` code runs and looks into blocks.
    
    results = engine.search("page 45", top_k_blocks=1)
    print(f"  REL: Search executed, returned {len(results)} results")
    
    # Cleanup
    shutil.rmtree(test_dir)
    print("Test Blocking Logic Passed")

if __name__ == "__main__":
    test_blocking_logic()
