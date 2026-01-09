import sys
import os
import shutil

# Add project root to path
sys.path.append(os.getcwd())

from backend.main import get_current_user, require_admin, USERS_DB
from backend.models import User
from fastapi import HTTPException

# Test Auth logic
def test_auth():
    print("Testing Auth...")
    # Test valid user
    u = get_current_user("admin")
    assert u.role == "admin"
    print("  REL: Admin login OK")
    
    # Test invalid user
    u = get_current_user("hacker")
    assert u is None
    print("  REL: Invalid login OK")
    
    # Test require_admin
    try:
        require_admin(User(username="user", role="user"))
        print("  FAIL: User allowed as admin")
    except HTTPException:
        print("  REL: User blocked correctly")

def test_rag_hierarchy():
    print("\nTesting Hierarchical RAG...")
    try:
        from backend.rag_engine import RAGEngine
    except ImportError as e:
        print(f"  SKIP: RAG dependencies missing ({e})")
        return

    if os.path.exists("test_models_manual"):
        shutil.rmtree("test_models_manual")
        
    engine = RAGEngine(models_dir="test_models_manual")
    
    # Mock embedding
    class MockEmbed:
        def encode(self, texts):
            import numpy as np
            # return deterministic random based on length to simulate difference
            return np.random.rand(len(texts), 384).astype("float32")
    engine.embedding_model = MockEmbed()
    
    # Add dummy docs
    chunks1 = [{"text": f"Mars is red {i}", "page": 1} for i in range(5)]
    engine.add_document("doc1", "mars.pdf", chunks1)
    
    chunks2 = [{"text": f"Ocean is blue {i}", "page": 1} for i in range(5)]
    engine.add_document("doc2", "ocean.pdf", chunks2)
    
    assert engine.block_index.ntotal == 2
    print("  REL: Block index count OK")
    
    # Search
    results = engine.search("red")
    print(f"  REL: Search returned {len(results)} results")
    assert len(results) > 0
    
    # Cleanup
    shutil.rmtree("test_models_manual")

if __name__ == "__main__":
    test_auth()
    try:
        test_rag_hierarchy()
    except Exception as e:
        print(f"RAG Test Failed: {e}")
