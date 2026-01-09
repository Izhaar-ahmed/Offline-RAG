import os
from llama_cpp import Llama

model_path = "models/Phi-3-mini-4k-instruct-Q4_K_M.gguf"
full_path = os.path.abspath(model_path)
print(f"Checking path: {full_path}")

try:
    print("Attempting to load model with n_gpu_layers=-1...")
    llm = Llama(
        model_path=model_path,
        n_ctx=4096,
        n_gpu_layers=-1, 
        n_threads=6,     
        verbose=True     
    )
    print("Model loaded successfully with GPU layers")
except Exception as e:
    print(f"Error loading model: {e}")
    import traceback
    traceback.print_exc()
