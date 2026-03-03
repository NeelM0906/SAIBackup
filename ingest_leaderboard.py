import json
import sqlite3
with open('data/email_colosseum.json', 'r') as f:
    data = json.load(f)
leaderboard = data['leaderboard']
conn = sqlite3.connect('email_ad.db')
c = conn.cursor()
for b in leaderboard:
    c.execute("""INSERT OR REPLACE INTO beings (id, type, content, wins, losses, score, generation, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
              (b['id'], b['type'], b['content'], b['wins'], b['losses'], b['score'], b['generation'], b['created_at']))
conn.commit()
conn.close()
print(f"Ingested {len(leaderboard)} beings from leaderboard.")