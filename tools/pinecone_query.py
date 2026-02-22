#!/usr/bin/env python3
"""
Pinecone Knowledge Base Query Tool
Queries the ecosystem's Pinecone indexes using OpenAI embeddings.
Usage: python3 pinecone_query.py --index <index_name> --query "your question" [--namespace <ns>] [--top_k 5]
"""

import argparse
import json
import os
import sys

try:
    from pinecone import Pinecone
    import urllib.request
except ImportError:
    print("Missing dependencies. Run: pip3 install pinecone")
    sys.exit(1)

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not PINECONE_API_KEY or not OPENAI_API_KEY:
    # Try loading from .env file
    env_path = os.path.expanduser("~/.openclaw/.env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    if key == 'PINECONE_API_KEY' and not PINECONE_API_KEY:
                        PINECONE_API_KEY = val
                    elif key == 'OPENAI_API_KEY' and not OPENAI_API_KEY:
                        OPENAI_API_KEY = val

if not PINECONE_API_KEY or not OPENAI_API_KEY:
    print("ERROR: PINECONE_API_KEY and OPENAI_API_KEY must be set (env vars or ~/.openclaw/.env)")
    sys.exit(1)

def get_embedding(text, model="text-embedding-3-small"):
    """Get embedding from OpenAI API."""
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    data = json.dumps({"input": text, "model": model}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    return result["data"][0]["embedding"]

def query_pinecone(index_name, query_text, namespace=None, top_k=5):
    """Query a Pinecone index with a text query."""
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(index_name)
    
    # Get embedding for query
    embedding = get_embedding(query_text)
    
    # Query Pinecone
    kwargs = {
        "vector": embedding,
        "top_k": top_k,
        "include_metadata": True
    }
    if namespace:
        kwargs["namespace"] = namespace
    
    results = index.query(**kwargs)
    return results

def main():
    parser = argparse.ArgumentParser(description="Query Pinecone knowledge base")
    parser.add_argument("--index", required=True, help="Pinecone index name")
    parser.add_argument("--query", required=True, help="Query text")
    parser.add_argument("--namespace", default=None, help="Namespace to query")
    parser.add_argument("--top_k", type=int, default=5, help="Number of results")
    parser.add_argument("--list-namespaces", action="store_true", help="List namespaces in the index")
    args = parser.parse_args()
    
    if args.list_namespaces:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(args.index)
        stats = index.describe_index_stats()
        print(f"\nNamespaces in '{args.index}':")
        for ns, ns_stats in stats.namespaces.items():
            ns_display = ns if ns else "(default)"
            print(f"  {ns_display}: {ns_stats.vector_count} vectors")
        return
    
    results = query_pinecone(args.index, args.query, args.namespace, args.top_k)
    
    print(f"\n🔍 Query: \"{args.query}\"")
    print(f"📂 Index: {args.index}" + (f" | Namespace: {args.namespace}" if args.namespace else ""))
    print(f"📊 Results: {len(results.matches)}\n")
    
    for i, match in enumerate(results.matches, 1):
        score = match.score
        metadata = match.metadata if match.metadata else {}
        print(f"--- Result {i} (score: {score:.4f}) ---")
        for key, value in metadata.items():
            # Truncate long values for display
            val_str = str(value)
            if len(val_str) > 500:
                val_str = val_str[:500] + "..."
            print(f"  {key}: {val_str}")
        print()

if __name__ == "__main__":
    main()
