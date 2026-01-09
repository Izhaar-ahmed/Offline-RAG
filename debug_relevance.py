from backend.rag_engine import RAGEngine

def debug_query(query):
    print(f"\n--- Debugging Query: '{query}' ---")
    engine = RAGEngine()
    
    # 1. Search with details
    results = engine.search(query, top_k_chunks=5, score_threshold=2.0) # Looser threshold to see what comes up
    
    if not results:
        print("No results found.")
        return

    print(f"Found {len(results)} results:")
    for i, res in enumerate(results):
        print(f"[{i}] Score: {res['score']:.4f} | Doc: {res['document_name']} (Pg {res['page']})")
        print(f"    Snippet: {res['text'][:100]}...")

if __name__ == "__main__":
    # Test with the user's typo
    debug_query("explain soft marigin classification")
    
    # Test with correct spelling
    debug_query("explain soft margin classification")
