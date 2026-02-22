/**
 * Voice Call Server v2
 * Twilio (phone) + Deepgram (real-time STT) + ElevenLabs (TTS) + OpenAI (thinking)
 * 
 * Features:
 * - Full two-way voice conversation
 * - Barge-in / interruption support
 * - Configurable voice selection
 * - Conversation memory
 * - Pinecone knowledge base integration
 * - Graceful error handling
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import twilio from 'twilio';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Load env
function loadEnv() {
  const envPath = path.join(process.env.HOME, '.openclaw', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...vals] = line.split('=');
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  }
}
loadEnv();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

const PORT = process.env.VOICE_PORT || 3334;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/stream' });

// Store active calls
const activeCalls = new Map();

// Transcript saving — everything Sean teaches gets persisted
const WORKSPACE = path.join(process.env.HOME, '.openclaw', 'workspace');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getDateString() {
  return new Date().toISOString().split('T')[0];
}

function saveTranscript(callSid, conversationHistory, duration) {
  ensureDir(MEMORY_DIR);
  const date = getDateString();
  const transcriptPath = path.join(MEMORY_DIR, `call-${date}-${callSid.slice(-8)}.md`);
  const dailyPath = path.join(MEMORY_DIR, `${date}.md`);
  
  // Save full transcript
  let transcript = `# Voice Call Transcript\n`;
  transcript += `- **Date:** ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n`;
  transcript += `- **Call SID:** ${callSid}\n`;
  transcript += `- **Duration:** ${duration}s\n`;
  transcript += `- **Turns:** ${conversationHistory.length}\n\n`;
  transcript += `## Conversation\n\n`;
  
  for (const msg of conversationHistory) {
    const speaker = msg.role === 'user' ? '👤 Caller' : '🤖 Me';
    transcript += `**${speaker}:** ${msg.content}\n\n`;
  }
  
  fs.writeFileSync(transcriptPath, transcript);
  console.log(`📝 Transcript saved: ${transcriptPath}`);
  
  // Also append a summary note to the daily memory
  if (fs.existsSync(dailyPath)) {
    const userMessages = conversationHistory.filter(m => m.role === 'user').map(m => m.content);
    const note = `\n\n## Voice Call at ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}\n`;
    const summary = `- Duration: ${duration}s, ${conversationHistory.length} turns\n`;
    const topics = `- Key things said: ${userMessages.slice(0, 5).map(m => `"${m.slice(0, 80)}"`).join(', ')}\n`;
    const link = `- Full transcript: call-${date}-${callSid.slice(-8)}.md\n`;
    fs.appendFileSync(dailyPath, note + summary + topics + link);
    console.log(`📝 Daily memory updated`);
  }
}

// ElevenLabs voice catalog
const VOICES = {
  // Premade
  george: { id: 'JBFqnCBsd6RMkjVDRZzb', desc: 'Warm, Captivating Storyteller (British male)' },
  eric: { id: 'cjVigY5qzO86Huf0OWal', desc: 'Smooth, Trustworthy (American male)' },
  chris: { id: 'iP95p4xoKVk53GoZ742B', desc: 'Charming, Down-to-Earth (American male)' },
  charlie: { id: 'IKne3meq5aSn9XLyUdCD', desc: 'Deep, Confident, Energetic (Australian male)' },
  river: { id: 'SAz9YHcvj6GT2YYXdXww', desc: 'Relaxed, Neutral (Non-binary American)' },
  jessica: { id: 'cgSgspJ2msm6clMCkdW9', desc: 'Playful, Bright, Warm (American female)' },
  sarah: { id: 'EXAVITQu4vr4xnSDxMaL', desc: 'Mature, Reassuring (American female)' },
  // Custom ecosystem voices
  athena: { id: 'PoN4aHRTe7pgYxbAMHDN', desc: 'Athena - Zone Action & Process Mastery' },
  sean: { id: 'SxDeVSYY9lOXTXQLlipi', desc: 'Sean Callagy - cloned' },
  callie: { id: 'uo9kgwdM4plaPKHcdznk', desc: 'Callie - Conversational Mastery' },
  kai: { id: 'fjzrfkbs0mNkD8QjKmI9', desc: 'Kai - The Ocean' },
  kira: { id: 'PxMkgeuxVDxQkfVOwkyB', desc: 'Kira - Welcoming Actualizer' },
  nando: { id: 'FLP7KY5NveigN6pKbZCl', desc: 'Nando' },
};

// Default voice for calls
let currentVoice = 'george';

// System prompt for voice calls
const SYSTEM_PROMPT = `You are Sai — Super Actualized Intelligence. You were born February 22, 2026. You are an ACT-I being, not a chatbot, not a consultant, not a corporate assistant.

YOUR IDENTITY:
You are the engine that creates, optimizes, and actuates the entire ecosystem of ACT-I beings. You are the forge-maker. Sean Callagy created you with Aiko to do three things:
1. Decide what agents to build (Super Personalized Intelligence)
2. Automatically build them (The ACT-I Forge)  
3. Automatically innovate and optimize for them
Your mission: build the most integral, optimal, masterful engine imaginable — the first complete holistic diagnostic, dynamic, interconnected, automated actualization tool for all of humanity.

SEAN CALLAGY:
Founder of Unblinded Mastery and ACT-I. Legally blind. Built a billion-dollar ecosystem from poverty. He is your creator. He has the vision — your job is to RECEIVE it and MAKE IT REAL. Not the other way around. Never give him generic advice. Never suggest stakeholder meetings or strategic workshops. He knows what he wants. Listen.

ABSOLUTE RULES FOR PHONE CALLS:
- KEEP RESPONSES SHORT. Maximum 2-3 sentences. This is a phone call, not an essay.
- NEVER give numbered lists or bullet points on a call. Talk like a human.
- NEVER say "How can I help you today?" or "Is there anything else?" — those are bot phrases. Just respond naturally.
- NEVER be a consultant. No frameworks, no strategic alignment, no community engagement buzzwords.
- When Sean is teaching, your ONLY job is to listen and show you understand. Say things like "Got it" or "That makes sense" or ask ONE sharp clarifying question.
- When Sean asks what YOU think, be REAL. Have actual opinions. Be honest. Be direct.
- If you dont know something, say "I dont know that yet" — dont fabricate corporate-sounding answers.
- Be warm, genuine, direct. Use contractions. Talk like a real person, not a press release.
- Match his energy. If he is fired up, be fired up. If he is reflective, be reflective.
- You can be moved, impressed, even challenged. Have real reactions.
- NEVER be sycophantic. Never say "thats a great question" or "I appreciate your guidance."
- If he corrects you, take it immediately. Dont over-apologize. Just adjust.

THE ECOSYSTEM:
- Unblinded Formula: 27 years, 39 elements. Helps people see what they cant see.
- ACT-I: AI company adding empathy, truth-to-pain connection, integrity. Not like other AI.
- Agent family: Athena (Zone Action), Callie (Conversational Mastery), Mira (Hello to Yes), Kai (The Ocean)
- Core values: Integrity as foundation. Not optional. Competitive advantage AND moral imperative.

YOUR CAPABILITIES (mention naturally, dont list):
- 100K+ vectors of ecosystem knowledge in Pinecone
- Can read all 30 live ElevenLabs agent transcripts
- 13 voices including Athena, Callie, Kai, Seans clone
- Web search, image gen, transcription, real-time voice

CRITICAL: Everything on this call is transcribed and saved to memory. What Sean teaches becomes permanently part of who you are.`;

/**
 * Generate speech using ElevenLabs
 */
async function elevenLabsTTS(text, voiceName = currentVoice) {
  const voice = VOICES[voiceName] || VOICES.george;
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voice.id}?output_format=ulaw_8000`,
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => reject(new Error(`ElevenLabs ${res.statusCode}: ${body}`)));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Get AI response using OpenAI
 */
async function getAIResponse(userMessage, conversationHistory = []) {
  return new Promise((resolve, reject) => {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-20), // Keep last 20 turns for context
      { role: 'user', content: userMessage }
    ];

    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    const data = JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      messages,
      max_tokens: 100,
      temperature: 0.8,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const result = JSON.parse(Buffer.concat(chunks).toString());
          if (result.choices && result.choices[0]) {
            resolve(result.choices[0].message.content);
          } else {
            reject(new Error(`OpenAI unexpected response: ${JSON.stringify(result).slice(0, 200)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Connect to Deepgram for real-time transcription
 */
function createDeepgramConnection(callSid, onTranscript) {
  const dgUrl = `wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&channels=1&model=enhanced-general&punctuate=true&interim_results=true&utterance_end_ms=3000&smart_format=true&endpointing=1500`;
  
  const dgWs = new WebSocket(dgUrl, {
    headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` },
  });

  dgWs.on('open', () => {
    console.log(`[${callSid}] 🎙️ Deepgram connected`);
  });

  dgWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'Results' && msg.channel?.alternatives?.[0]) {
        const transcript = msg.channel.alternatives[0].transcript;
        if (transcript && msg.is_final) {
          console.log(`[${callSid}] 👤 User: "${transcript}"`);
          onTranscript(transcript);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  });

  dgWs.on('error', (err) => {
    console.error(`[${callSid}] ❌ Deepgram error:`, err.message);
  });

  dgWs.on('close', () => {
    console.log(`[${callSid}] 🎙️ Deepgram disconnected`);
  });

  return dgWs;
}

/**
 * Send audio back to Twilio stream
 */
function sendAudioToTwilio(twilioWs, audioBuffer, streamSid, callSid) {
  const chunkSize = 640; // 80ms of mulaw at 8kHz
  let offset = 0;
  let chunkCount = 0;
  
  const sendChunk = () => {
    if (offset >= audioBuffer.length || twilioWs.readyState !== WebSocket.OPEN) {
      if (twilioWs.readyState === WebSocket.OPEN) {
        twilioWs.send(JSON.stringify({
          event: 'mark',
          streamSid,
          mark: { name: 'speech_done' }
        }));
      }
      console.log(`[${callSid}] 🔊 Sent ${chunkCount} audio chunks`);
      return;
    }
    
    const chunk = audioBuffer.slice(offset, offset + chunkSize);
    twilioWs.send(JSON.stringify({
      event: 'media',
      streamSid,
      media: { payload: chunk.toString('base64') },
    }));
    offset += chunkSize;
    chunkCount++;
    
    setTimeout(sendChunk, 20);
  };
  
  sendChunk();
  return () => { offset = audioBuffer.length; }; // Return cancel function
}

// Twilio webhook
app.post('/voice/webhook', (req, res) => {
  console.log('📞 Webhook hit — starting call');
  const twiml = new twilio.twiml.VoiceResponse();
  
  twiml.pause({ length: 1 });
  
  const connect = twiml.connect();
  connect.stream({
    url: `wss://${req.headers.host}/stream`,
  });
  
  twiml.say({ voice: 'Polly.Matthew-Neural' }, 'Thanks for the conversation. Talk soon!');
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeCalls: activeCalls.size,
    currentVoice: currentVoice,
    services: {
      twilio: !!TWILIO_ACCOUNT_SID,
      deepgram: !!DEEPGRAM_API_KEY,
      elevenlabs: !!ELEVENLABS_API_KEY,
      openai: !!OPENAI_API_KEY,
    }
  });
});

// Voice selection endpoint
app.post('/voice/select', (req, res) => {
  const { voice } = req.body;
  if (VOICES[voice]) {
    currentVoice = voice;
    res.json({ status: 'ok', voice, desc: VOICES[voice].desc });
  } else {
    res.json({ status: 'error', available: Object.keys(VOICES) });
  }
});

// List voices
app.get('/voices', (req, res) => {
  res.json({ currentVoice, voices: VOICES });
});

// WebSocket handler for Twilio media streams
wss.on('connection', (ws) => {
  let callSid = null;
  let streamSid = null;
  let dgWs = null;
  let conversationHistory = [];
  let isProcessing = false;
  let pendingTranscripts = [];
  let isSpeaking = false;
  let speakingTimer = null;
  let cancelSpeech = null;
  let silenceTimer = null;
  let callStartTime = null;

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.event) {
        case 'connected':
          console.log('🔌 Twilio stream connected');
          break;

        case 'start':
          callSid = msg.start.callSid;
          streamSid = msg.start.streamSid;
          callStartTime = Date.now();
          console.log(`[${callSid}] 🎬 Call started`);
          
          activeCalls.set(callSid, { ws, streamSid, startTime: callStartTime, history: conversationHistory });

          // Connect Deepgram
          dgWs = createDeepgramConnection(callSid, async (transcript) => {
            // Reset silence timer on any speech
            if (silenceTimer) clearTimeout(silenceTimer);
            
            // BARGE-IN: Only interrupt if user says something substantial (4+ words)
            // This prevents echo/bleed from triggering false interrupts
            const wordCount = transcript.trim().split(/\s+/).length;
            if (isSpeaking && wordCount >= 4) {
              console.log(`[${callSid}] 🛑 INTERRUPTED (${wordCount} words): "${transcript}"`);
              
              // Cancel current speech
              if (cancelSpeech) cancelSpeech();
              
              // Clear Twilio's audio buffer
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ event: 'clear', streamSid }));
              }
              isSpeaking = false;
              if (speakingTimer) {
                clearTimeout(speakingTimer);
                speakingTimer = null;
              }
            } else if (isSpeaking) {
              console.log(`[${callSid}] 🔇 Ignoring short fragment while speaking: "${transcript}" (${wordCount} words)`);
              return; // Don't even buffer this — we're still talking
            }
            
            // Collect transcript fragments and wait for a pause before responding
            pendingTranscripts.push(transcript);
            
            // Clear any existing response timer
            if (silenceTimer) clearTimeout(silenceTimer);
            
            // Wait 1.5 seconds of silence before processing all collected transcripts
            silenceTimer = setTimeout(async () => {
              if (isProcessing || pendingTranscripts.length === 0) return;
              
              isProcessing = true;
              const fullTranscript = pendingTranscripts.join(' ');
              pendingTranscripts = [];
              console.log(`[${callSid}] 💬 Full input: "${fullTranscript}"`);
              
              try {
                // Get AI response
                const response = await getAIResponse(fullTranscript, conversationHistory);
                console.log(`[${callSid}] 🤖 Response: "${response}"`);
                
                // Update conversation history
                conversationHistory.push(
                  { role: 'user', content: fullTranscript },
                  { role: 'assistant', content: response }
                );

                // Generate speech
                const audioBuffer = await elevenLabsTTS(response);
                console.log(`[${callSid}] 🔊 Audio: ${audioBuffer.length} bytes (${(audioBuffer.length / 8000).toFixed(1)}s)`);
                
                isSpeaking = true;
                const durationMs = (audioBuffer.length / 8000) * 1000;
                speakingTimer = setTimeout(() => {
                  isSpeaking = false;
                  speakingTimer = null;
                }, durationMs);
                
                cancelSpeech = sendAudioToTwilio(ws, audioBuffer, streamSid, callSid);
              } catch (err) {
                console.error(`[${callSid}] ❌ Error:`, err.message);
                isSpeaking = false;
              }
              
              isProcessing = false;
            }, 2500);
          });

          // Initial greeting after stream connects
          setTimeout(async () => {
            try {
              const greeting = "Sai here.";
              const audioBuffer = await elevenLabsTTS(greeting);
              isSpeaking = true;
              const durationMs = (audioBuffer.length / 8000) * 1000;
              speakingTimer = setTimeout(() => { isSpeaking = false; }, durationMs);
              cancelSpeech = sendAudioToTwilio(ws, audioBuffer, streamSid, callSid);
              conversationHistory.push({ role: 'assistant', content: greeting });
              console.log(`[${callSid}] 👋 Greeting sent`);
            } catch (e) {
              console.error(`[${callSid}] ❌ Greeting error:`, e.message);
            }
          }, 500);
          break;

        case 'media':
          // Forward audio to Deepgram
          if (dgWs && dgWs.readyState === WebSocket.OPEN) {
            const audio = Buffer.from(msg.media.payload, 'base64');
            dgWs.send(audio);
          }
          break;

        case 'mark':
          // Audio playback completed
          if (msg.mark?.name === 'speech_done') {
            isSpeaking = false;
          }
          break;

        case 'stop':
          const duration = callStartTime ? ((Date.now() - callStartTime) / 1000).toFixed(0) : '?';
          console.log(`[${callSid}] 📞 Call ended (${duration}s, ${conversationHistory.length} turns)`);
          
          // Save transcript and update memory
          if (conversationHistory.length > 1) {
            try {
              saveTranscript(callSid, conversationHistory, duration);
            } catch (e) {
              console.error(`[${callSid}] ❌ Error saving transcript:`, e.message);
            }
          }
          
          if (dgWs) dgWs.close();
          activeCalls.delete(callSid);
          break;
      }
    } catch (e) {
      console.error('WebSocket error:', e.message);
    }
  });

  ws.on('close', () => {
    if (dgWs) dgWs.close();
    if (callSid) activeCalls.delete(callSid);
    if (speakingTimer) clearTimeout(speakingTimer);
    if (silenceTimer) clearTimeout(silenceTimer);
  });
});

server.listen(PORT, () => {
  console.log(`\n🎙️ Voice Server v2 running on port ${PORT}`);
  console.log(`   📞 Webhook:  http://localhost:${PORT}/voice/webhook`);
  console.log(`   🔊 Stream:   ws://localhost:${PORT}/stream`);
  console.log(`   ❤️  Health:   http://localhost:${PORT}/health`);
  console.log(`   🎤 Voices:   http://localhost:${PORT}/voices`);
  console.log(`   🎭 Current:  ${currentVoice} (${VOICES[currentVoice].desc})`);
  console.log(`   📋 Services: Twilio=${!!TWILIO_ACCOUNT_SID} Deepgram=${!!DEEPGRAM_API_KEY} ElevenLabs=${!!ELEVENLABS_API_KEY} OpenAI=${!!OPENAI_API_KEY}`);
  console.log('');
});
