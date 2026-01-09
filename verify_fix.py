import requests
import json
import time

def test_chat():
    url = "http://127.0.0.1:8000/chat"
    payload = {"message": "explain soft marigin classification"}
    
    print(f"Sending query: {payload['message']}")
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print("\n--- Response ---")
        print(f"Answer: {data['answer']}")
        print("----------------")
        
        if "available" in data['answer'].lower() and "soft margin" not in data['answer'].lower():
             print("RESULT: Correctly Refused (or Not Found).")
        elif "soft margin" in data['answer'].lower():
             print("RESULT: Correctly Answered.")
        elif "softmax" in data['answer'].lower():
             print("RESULT: FAILURE - Returned Softmax.")
        else:
             print("RESULT: Unknown response.")
             
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Wait for server to potentially start
    time.sleep(2)
    test_chat()
