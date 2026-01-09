from backend.rag_engine import RAGEngine
import pprint

def debug_query():
    print("Initialize Engine...")
    engine = RAGEngine()
    
    query = "what are large image models"
    print(f"\nScanning for: '{query}'")
    
    # 1. Inspect Retrieval
    results = engine.search(query, k=5)
    print(f"\n--- Retrieved {len(results)} Chunks ---")
    for i, res in enumerate(results):
        print(f"\n[Chunk {i+1}] Score: {res['score']:.4f} | Source: {res['document_name']} (Pg {res.get('page')})")
        print(f"Content: {res['text'][:300]}...") # Print first 300 chars
        
    # 2. Inspect citations logic
    response = engine.generate_answer(query)
    print(f"\n--- Generated Answer ---\n{response['answer']}")
    
if __name__ == "__main__":
    debug_query()
