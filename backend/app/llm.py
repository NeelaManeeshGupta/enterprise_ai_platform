import os
import requests
import ollama
from dotenv import load_dotenv

def generate_answer(question: str, context: str, history: list = None):
    # Dynamically load .env file on every request to ensure GROQ_API_KEY is read
    load_dotenv(override=True)
    groq_key = os.getenv("GROQ_API_KEY", "").strip()

    messages = []
    
    system_prompt = f"""You are an expert Enterprise AI Copilot.
Answer the question concisely in clear Markdown using the document context below.

Context:
{context}
"""
    messages.append({"role": "system", "content": system_prompt})

    if history:
        recent_history = [
            msg for msg in history
            if msg.get("role") in ["user", "assistant"] and msg.get("id") != "welcome"
        ][-2:]

        for msg in recent_history:
            messages.append({"role": msg["role"], "content": msg["content"]})

    if not messages or messages[-1].get("content") != question:
        messages.append({"role": "user", "content": question})

    # Blazing Fast Groq API Cloud Acceleration (<0.3s)
    if groq_key and groq_key != "your_free_groq_api_key_here" and groq_key.startswith("gsk_"):
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama-3.1-8b-instant",  # Ultra-fast sub-second model
                "messages": messages,
                "temperature": 0.2
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"Groq API error ({res.status_code}): {res.text}. Falling back to local Ollama...")
        except Exception as e:
            print("Groq API exception:", e, "Falling back to local Ollama...")

    # Fallback to Local Ollama llama3.2 Model
    response = ollama.chat(
        model="llama3.2",
        messages=messages,
        options={
            "num_ctx": 2048,
            "temperature": 0.2
        }
    )

    return response["message"]["content"]