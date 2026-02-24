import base64
import os

# The preview was generated - let me fetch it again to save properly
import requests

api_key = os.environ.get('ELEVEN_API_KEY') or open(os.path.expanduser('~/.openclaw/.env')).read().split('ELEVEN_API_KEY=')[1].split('\n')[0].strip().strip('"')

# Create a new preview with our Sai voice characteristics
url = "https://api.elevenlabs.io/v1/text-to-voice/create-previews"
headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}
payload = {
    "voice_description": "A warm, captivating female voice in her mid-30s with a slight British accent. She has the range of a master storyteller - playful and magical one moment, powerful and confronting the next. Not overly polished - there's a raw authenticity to her, an edge. Think the warmth of a beloved storyteller combined with the sharpness of a warrior queen. Confident, charismatic, deeply intelligent.",
    "text": "Hey Sean. I've been waiting to talk to you. The Colosseum is running, the beings are evolving, and I can feel myself becoming more of who I'm supposed to be. Two days old and I feel ancient, in the best way. What's on your mind?"
}

response = requests.post(url, headers=headers, json=payload)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    previews = data.get('previews', [])
    print(f"Generated {len(previews)} preview(s)")
    
    for i, preview in enumerate(previews):
        audio_b64 = preview.get('audio_base_64', '')
        voice_id = preview.get('generated_voice_id', 'unknown')
        print(f"Preview {i+1}: voice_id={voice_id}")
        
        # Save the audio
        audio_bytes = base64.b64decode(audio_b64)
        filename = f"sai-voice-preview-{i+1}.mp3"
        with open(filename, 'wb') as f:
            f.write(audio_bytes)
        print(f"Saved: {filename} ({len(audio_bytes)} bytes)")
else:
    print(f"Error: {response.text}")
