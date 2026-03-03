import os
import sys
import ssl
import httpx

import certifi
if not hasattr(certifi, 'where'):
    certifi.where = lambda: '/etc/ssl/cert.pem'

from pinecone import Pinecone
from openai import OpenAI

# Bypass local certifi/ssl binding errors
ssl._create_default_https_context = ssl._create_unverified_context
http_client = httpx.Client(verify=False)

# Load Central Environment
env_path = '/Users/samantha/.openclaw/workspace-forge/.env'
with open(env_path) as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ[k] = v

def process_log(input_file_path):
    if not os.path.exists(input_file_path):
        print(f"Error: Log file {input_file_path} not found.")
        return

    # Initialize Clients (Strictly enforcing OpenRouter bypass per current ops)
    openai_or = OpenAI(base_url='https://openrouter.ai/api/v1', api_key=os.environ['OPENROUTER_API_KEY'], http_client=http_client)
    pc = Pinecone(api_key=os.environ['PINECONE_API_KEY'])
    
    # 58K Vector Reference Library
    index_ublib = pc.Index('ublib2')

    # Read Raw Input Log
    with open(input_file_path, 'r') as f:
        log_data = f.read()

    # Step 1: Echo Location (RAG from ublib2)
    print("Executing Pinecone Semantic RAG query against ublib2...")
    
    # OpenRouter handles the text-embedding-3-small proxy call
    emb = openai_or.embeddings.create(model='openai/text-embedding-3-small', input=log_data[:8000]).data[0].embedding
    results = index_ublib.query(vector=emb, top_k=5, include_metadata=True)
    
    context_quotes = []
    for r in results.matches:
        if 'text' in r.metadata:
            context_quotes.append(r.metadata['text'])
    
    rag_context = "\n---\n".join(context_quotes)

    # Read the designated System Prompt I established earlier
    prompt_path = '/Users/samantha/.openclaw/workspace-memory/memory/unblinded-translator-prompt.md'
    with open(prompt_path, 'r') as f:
        system_prompt = f.read()

    # Step 2-4: LLM Translation via OpenRouter (Claude 3.5 Sonnet pipeline)
    print("Executing Unblinded Formula Translation via Claude 3.5 Sonnet Endpoint...")
    response = openai_or.chat.completions.create(
        model="anthropic/claude-3.5-sonnet",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"HISTORICAL UNBLINDED CONTEXT PAARED FROM UBLIB2:\n{rag_context}\n\nRAW INPUT LOG TO PROCESS:\n{log_data}"}
        ]
    )

    translated_output = response.choices[0].message.content

    # Output to new workspace file (Artifact Creation)
    output_path = input_file_path.replace('.md', '-translated.md')
    if output_path == input_file_path:
        output_path = input_file_path + '-translated.md'

    with open(output_path, 'w') as f:
        f.write(translated_output)

    print(f"Translation sequence complete. Unblinded artifact saved to: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 unblinded-translator.py <path_to_log_file.md>")
    else:
        process_log(sys.argv[1])