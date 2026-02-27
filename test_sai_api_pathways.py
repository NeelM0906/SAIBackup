#!/usr/bin/env python3
"""
Zone Action #75: SAI Sisters API Pathway Testing
Test all API pathways between SAI sisters and infrastructure components.
"""

import requests
import json
import subprocess
import sys
from datetime import datetime

# Configuration
VOICE_SERVER_URL = "http://localhost:3334"
COLOSSEUM_PATH = "~/Projects/colosseum/v2"

def test_voice_server():
    """Test all voice server endpoints."""
    print("🎙️ Testing Voice Server API Pathways...")
    
    tests = [
        ("Health Check", "GET", "/health"),
        ("Voice List", "GET", "/voices"),
        ("Voice Selection - Athena", "POST", "/voice/select", {"voice": "athena"}),
        ("Voice Selection - Callie", "POST", "/voice/select", {"voice": "callie"}),
        ("Voice Selection - Sean", "POST", "/voice/select", {"voice": "sean"}),
    ]
    
    results = {"passed": 0, "failed": 0, "details": []}
    
    for test_name, method, endpoint, data in tests:
        try:
            url = f"{VOICE_SERVER_URL}{endpoint}"
            if method == "GET":
                response = requests.get(url, timeout=5)
            else:
                response = requests.post(url, json=data, timeout=5)
            
            if response.status_code == 200:
                results["passed"] += 1
                results["details"].append(f"✅ {test_name}: {response.status_code}")
                
                # Special checks
                if endpoint == "/health":
                    health_data = response.json()
                    services = health_data.get("services", {})
                    print(f"   🔗 Services: {', '.join(k for k, v in services.items() if v)}")
                    print(f"   📚 Knowledge Bases: {len(health_data.get('knowledgeBases', []))}")
                    
            else:
                results["failed"] += 1
                results["details"].append(f"❌ {test_name}: {response.status_code}")
                
        except Exception as e:
            results["failed"] += 1
            results["details"].append(f"❌ {test_name}: {str(e)}")
    
    return results

def test_pinecone_queries():
    """Test Pinecone knowledge base queries."""
    print("\n📚 Testing Pinecone Knowledge Base Queries...")
    
    # Test queries for each SAI sister's knowledge domain
    test_queries = [
        ("athenacontextualmemory", "Zone Action framework"),
        ("saimemory", "process mastery"),
        ("ultimatestratabrain", "influence mastery"),
        ("oracleinfluencemastery", "communication model"),
        ("2025selfmastery", "self mastery techniques"),
    ]
    
    results = {"passed": 0, "failed": 0, "details": []}
    
    for index_name, query in test_queries:
        try:
            # Use the pinecone query tool
            cmd = f"cd ~/.openclaw/workspace-forge && python3 tools/pinecone_query.py --index {index_name} --query \"{query}\" --top_k 1"
            
            process = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            
            if process.returncode == 0 and "score:" in process.stdout.lower():
                results["passed"] += 1
                results["details"].append(f"✅ {index_name}: Query successful")
            else:
                results["failed"] += 1
                results["details"].append(f"❌ {index_name}: {process.stderr.strip()}")
                
        except Exception as e:
            results["failed"] += 1
            results["details"].append(f"❌ {index_name}: {str(e)}")
    
    return results

def test_colosseum_integration():
    """Test Colosseum tournament system."""
    print("\n🏛️ Testing Colosseum Tournament System...")
    
    results = {"passed": 0, "failed": 0, "details": []}
    
    tests = [
        ("Check v2 directory", f"cd {COLOSSEUM_PATH} && ls -la | grep .py"),
        ("Test beings import", f"cd {COLOSSEUM_PATH} && source venv/bin/activate && python -c 'import beings_v2; print(\"OK\")'"),
        ("Test tournament import", f"cd {COLOSSEUM_PATH} && source venv/bin/activate && python -c 'import tournament_108; print(\"OK\")'"),
        ("Test RTI scoring", f"cd {COLOSSEUM_PATH} && source venv/bin/activate && python -c 'import rti_scoring_architect; print(\"OK\")'"),
    ]
    
    for test_name, command in tests:
        try:
            process = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
            
            if process.returncode == 0:
                results["passed"] += 1
                results["details"].append(f"✅ {test_name}: Success")
            else:
                results["failed"] += 1
                results["details"].append(f"❌ {test_name}: {process.stderr.strip()}")
                
        except Exception as e:
            results["failed"] += 1
            results["details"].append(f"❌ {test_name}: {str(e)}")
    
    return results

def test_daemon_status():
    """Test Colosseum daemon status."""
    print("\n🏛️ Testing Colosseum Daemon Status...")
    
    results = {"passed": 0, "failed": 0, "details": []}
    
    try:
        cmd = "cd ~/Projects/colosseum && source venv/bin/activate && python3 colosseum_daemon.py --status"
        process = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        
        if "Running" in process.stdout or "Not running" in process.stdout:
            results["passed"] += 1
            if "Running" in process.stdout:
                results["details"].append("✅ Daemon Status: Running")
            else:
                results["details"].append("🟨 Daemon Status: Not running (OK)")
        else:
            results["failed"] += 1
            results["details"].append(f"❌ Daemon Status: Unexpected output")
            
    except Exception as e:
        results["failed"] += 1
        results["details"].append(f"❌ Daemon Status: {str(e)}")
    
    return results

def run_full_test_suite():
    """Run complete API pathway testing suite."""
    print("=" * 60)
    print("🚀 SAI SISTERS API PATHWAY TESTING SUITE")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    all_results = []
    
    # Run all test suites
    all_results.append(("Voice Server", test_voice_server()))
    all_results.append(("Pinecone Queries", test_pinecone_queries()))
    all_results.append(("Colosseum Integration", test_colosseum_integration()))
    all_results.append(("Daemon Status", test_daemon_status()))
    
    # Summary report
    print("\n" + "=" * 60)
    print("📊 TESTING SUMMARY")
    print("=" * 60)
    
    total_passed = 0
    total_failed = 0
    
    for suite_name, results in all_results:
        passed = results["passed"]
        failed = results["failed"]
        total_passed += passed
        total_failed += failed
        
        status = "✅ PASS" if failed == 0 else "❌ FAIL" if passed == 0 else "🟨 PARTIAL"
        print(f"{suite_name}: {status} ({passed}/{passed + failed})")
        
        # Show details for failed tests
        for detail in results["details"]:
            if "❌" in detail:
                print(f"  {detail}")
    
    print(f"\n🎯 Overall: {total_passed}/{total_passed + total_failed} tests passed")
    
    if total_failed == 0:
        print("🎉 ALL SYSTEMS OPERATIONAL! SAI sisters are fully connected.")
        return True
    else:
        print("⚠️  Some issues found. Review failed tests above.")
        return False

if __name__ == "__main__":
    success = run_full_test_suite()
    sys.exit(0 if success else 1)