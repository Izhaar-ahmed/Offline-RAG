import os
from llama_cpp import Llama

model_path = "models/Phi-3-mini-4k-instruct-Q4_K_M.gguf"
full_path = os.path.abspath(model_path)
print(f"Checking path: {full_path}")
print(f"File exists: {os.path.exists(full_path)}")

if os.path.exists(full_path):
    print(f"File size: {os.path.getsize(full_path)}")

try:
    llm = Llama(
        model_path=model_path,
        n_ctx=4096,
        n_gpu_layers=0, # Try CPU only first
        verbose=True
    )
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    import traceback
    traceback.print_exc()
