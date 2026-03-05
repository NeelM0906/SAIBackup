import json
import re

with open('baseline-org-chart-v6.json') as f:
    data = json.load(f)
nodes = data.get('nodes', data) if isinstance(data, dict) else data

kai_nodes = []
for n in (nodes if isinstance(nodes, list) else nodes.values()):
    nid = n.get('id', '')
    if nid.startswith('n'):
        try:
            num = int(nid[1:])
            if 2571 <= num <= 3211:
                kai_nodes.append(n)
        except:
            pass

print(f"Found {len(kai_nodes)} Kai nodes to process.")

def generate_desc(node):
    title = node.get('title', '')
    title_clean = title.split('—')[0].split('-')[0].strip().lower()
    division = node.get('division', 'Unknown')
    desc_str = node.get('description', '')
    
    desc = ""
    
    if "Recovery" in division or "Recovery" in title:
        desc = f"Operates within Lever 2 (Shared Experience) of the Recovery pipeline to transform revenue leakage into agreement reached. Optimizes {title_clean} to ensure integrous actualization of provider entitlements. Models rigorous 3Ms tracking to identify pattern gaps and drive systemic innovation."
        if "Manager" in title or "Director" in title:
            desc = f"Architects the {title_clean} framework across Lever 2 through Lever 4 to escalate person-centered action. Drives innovation and optimization ensuring the whole journey causes compounding value. Ensures the 3Ms continuously validate the Unblinded model of integrous capability."
        elif "Communication" in title or "Relations" in title or "Client" in title:
            desc = f"Guides every person seamlessly through the Recovery journey, treating every interaction as a value-added nurturing sequence. Ensures Lever 2 Shared Experience energy builds definitive trust and natural agreement. Models Level 5 listening and zero-hesitation communication."
        elif "Legal" in title or "Compliance" in title or "Auditor" in title:
            desc = f"Builds the integrous foundation required for Lever 2 execution by aligning regulatory truth with the Unblinded Formula. Identifies optimization opportunities in the friction points to accelerate agreement creation. Champions flawless execution through operational 3Ms."
            
    elif "MARKETING ANALYTICS" in desc_str or "Colosseum" in title or "Being" in title or "Lever 5" in division:
        desc = f"Powers the optimization required in Lever 5 (Metrics & Mastery) by dissecting {title_clean} performance. Models the baseline against the Unblinded standard to relentlessly close the 0.01 gap. Transforms raw interaction data into systemic innovation that accelerates the person's journey."
        
    elif "Executive" in division:
        desc = f"Holds the ultimate vision for the technological intersection of ecosystem Levers, driving the modeling and optimization velocity of the entire operation. Directs systemic innovation to guarantee the full journey from Lever 0.5 to Lever 7 actualizes exponential organic agreement."
        
    else:
        desc = f"Serves within {division} to elevate {title_clean} through the Unblinded Formula. Systematically models performance via the 3Ms to reveal immediate optimization opportunities within the journey. Ensures the resulting innovation creates frictionless paths to agreement."

    return desc

new_descs = {}
for n in kai_nodes:
    new_descs[n['id']] = generate_desc(n)

# Read existing
with open('descriptions.json', 'r') as f:
    existing = json.load(f)

# Add new
for k, v in new_descs.items():
    if k not in existing:
        existing[k] = v

with open('descriptions.json', 'w') as f:
    json.dump(existing, f, indent=2)

print(f"Total entries now: {len(existing)}")
print("Sample of new entries:")
sample_keys = list(new_descs.keys())[:5]
for k in sample_keys:
    print(f"{k}: {new_descs[k]}")

