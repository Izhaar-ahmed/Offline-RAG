import os
import shutil
import pytest
from fastapi.testclient import TestClient
from backend.main import app, USERS_DB
from backend.rag_engine import RAGEngine

client = TestClient(app)

# Cleanup function
def cleanup():
    if os.path.exists("test_models"):
        shutil.rmtree("test_models")

@pytest.fixture(scope="module", autouse=True)
def setup_teardown():
    cleanup()
    yield
    cleanup()

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_login_success():
    response = client.post("/auth/login", json={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    assert "token" in response.json()
    assert response.json()["role"] == "admin"

def test_login_failure():
    response = client.post("/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401

def test_upload_protected_without_token():
    # Attempt upload without token
    # We need a dummy file
    with open("dummy.txt", "w") as f:
        f.write("test content")
    
    with open("dummy.txt", "rb") as f:
        response = client.post("/upload", files={"file": ("dummy.txt", f)})
    
    os.remove("dummy.txt")
    # Should be 403 Forbidden because no token provided (dependency defaults to None)
    assert response.status_code == 403

def test_upload_protected_with_user_token():
    # Upload with non-admin token
    with open("dummy.txt", "w") as f:
        f.write("test content")
    
    with open("dummy.txt", "rb") as f:
        response = client.post("/upload?user_token=user", files={"file": ("dummy.txt", f)})
    
    os.remove("dummy.txt")
    assert response.status_code == 403

def test_rag_hierarchical_logic():
    # Test RAGEngine directly to verify split logic
    # Use a temp dir for models
    test_models_dir = "test_models"
    engine = RAGEngine(models_dir=test_models_dir)
    
    # Mock embedding model to avoid loading big model or network
    # We can patch it, or just let it use the default Small model if it downloads fast
    # For this environment, we might rely on the existing one or mock it.
    # Let's mock the encode method for speed and isolation
    class MockEmbedding:
        def encode(self, texts):
            # Return dummy vectors of dim 384
            import numpy as np
            return np.random.rand(len(texts), 384).astype("float32")
            
    engine.embedding_model = MockEmbedding()
    
    # Add dummy document
    chunks = [{"text": f"chunk {i}", "page": 1} for i in range(10)]
    engine.add_document("doc1", "test_doc.pdf", chunks)
    
    assert engine.block_index.ntotal == 1
    assert "doc1" in engine.chunk_indexes
    assert engine.chunk_indexes["doc1"].ntotal == 10
    
    # Search
    results = engine.search("query")
    assert len(results) <= 5 # Top K chunks
    
    print("RAG Hierarchical Test Passed")

