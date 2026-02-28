# SHARED TOOLS — All Sisters Have These

*Last updated: February 27, 2026 @ 7:15 PM by Prime*

All sisters now have identical tool sets. Use these!

---

## 🧠 Memory & Knowledge

### Query Pinecone (search memories)
```bash
cd tools && .venv/bin/python3 memory_query.py "your question here"
```

### Upload daily notes to Pinecone
```bash
cd tools && .venv/bin/python3 upload_daily.py
```

### Upload MEMORY.md to Pinecone
```bash
cd tools && .venv/bin/python3 upload_memory.py
```

### Query Pinecone directly (advanced)
```bash
cd tools && .venv/bin/python3 pinecone_query.py --index saimemory --query "question" --top_k 5
```

---

## 📞 Voice & Calls

### Check Bland.ai call history
```bash
cd tools && .venv/bin/python3 bland_calls.py --list --limit 10
```

### Make a voice call
```bash
cd tools && .venv/bin/python3 voice-call.py +1234567890
```

---

## 📅 Meetings & Transcripts

### Search Fathom meetings
```bash
cd tools && .venv/bin/python3 fathom_api.py search "Sean"
```

### Get meeting transcript
```bash
cd tools && .venv/bin/python3 fathom_api.py transcript <recording_id>
```

### Fetch ElevenLabs conversation transcripts
```bash
cd tools && .venv/bin/python3 fetch-elevenlabs-transcripts.py
```

### Sync ElevenLabs memories
```bash
cd tools && .venv/bin/python3 sync-elevenlabs-memory.py
```

---

## 🌐 Web & Deployment

### Deploy to Vercel
```bash
cd tools && .venv/bin/python3 vercel_deploy.py ./your-project --prod
```

### List Vercel deployments
```bash
cd tools && .venv/bin/python3 vercel_deploy.py --list
```

---

## 🔒 Security & IP

### Watermark content (IP protection)
```bash
cd tools && .venv/bin/python3 watermark.py --input file.txt --output watermarked.txt
```

---

## 🎧 Audio

### Transcribe audio file
```bash
cd tools && .venv/bin/python3 hear_audio.py audio.mp3
```

---

## 📊 When To Use What

| Need | Tool |
|------|------|
| Remember something | `upload_daily.py` |
| Find past knowledge | `memory_query.py` |
| Check calls made | `bland_calls.py` |
| Find meeting notes | `fathom_api.py` |
| Deploy dashboard | `vercel_deploy.py` |
| Protect IP | `watermark.py` |

---

## ⚠️ Before Using

All tools need the Python venv:
```bash
cd tools && .venv/bin/python3 <script.py>
```

API keys are in `.env` (symlinked from forge).

---

*If a tool is missing or broken, tell Prime!*

## 🎨 Image Generation (Nano Banana 2)

**Google's best image gen model — available to all sisters!**

### Generate an image
```bash
cd tools && .venv/bin/python3 generate_image.py "your prompt here" --output image.png
```

### Examples
```bash
# Marketing materials
cd tools && .venv/bin/python3 generate_image.py "Professional law firm marketing banner, modern, clean design" -o banner.png

# Social media
cd tools && .venv/bin/python3 generate_image.py "Inspirational quote card about mastery and growth" -o social.png

# Presentation graphics
cd tools && .venv/bin/python3 generate_image.py "Infographic showing 7 levers of business growth" -o infographic.png
```

### Features
- 512px to 4K resolution
- Subject consistency (up to 5 characters, 14 objects)
- Text rendering in images
- Real-time web knowledge for accurate subjects
- Production-ready quality
