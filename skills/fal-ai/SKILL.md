---
name: fal-ai
description: "Generate and analyze video/images via fal.ai unified API. Supports 1000+ models: text-to-video, image-to-video, text-to-image, video analysis, upscaling, lipsync, and more."
metadata:
  openclaw:
    emoji: "🎬"
    requires:
      env: [FAL_KEY]
      bins: [python3]
---

# fal.ai — Unified Video & Image Generation

One API key. 1000+ models. Video gen, image gen, video analysis, lipsync, upscaling, and more.

## Setup

1. Get API key: https://fal.ai/dashboard/keys
2. Add to `~/.openclaw/.env`:
   ```
   FAL_KEY=your_key_here
   ```
3. SDK installed in workspace venv: `fal-client==0.13.1`

## Quick Start

All commands run from the skill directory:

```bash
cd {baseDir} && /Users/samantha/.openclaw/workspace/tools/.venv/bin/python3 fal_generate.py <command> [options]
```

### Text-to-Video

```bash
python3 fal_generate.py video --prompt "A golden retriever running through a sunlit meadow" --model kling-v2 --duration 5
```

### Image-to-Video

```bash
python3 fal_generate.py video --image /path/to/image.jpg --prompt "camera slowly zooms in" --model kling-v2
```

### Text-to-Image

```bash
python3 fal_generate.py image --prompt "A cyberpunk cityscape at night" --model flux-dev
```

### Video Analysis (Depth Map)

```bash
python3 fal_generate.py depth --video /path/to/video.mp4
```

## Available Models

### Video Generation
| Model ID | Name | Strengths | Duration |
|----------|------|-----------|----------|
| `kling-v2` | Kling V2 Master | Human motion, faces | 5-10s |
| `kling-v2-turbo` | Kling V2.5 Turbo | Fast, good quality | 5-10s |
| `ltx-video` | LTX-2 19B | Audio + video | 5s |
| `minimax-video` | MiniMax Hailuo | Long form, creative | 6s |
| `veo3` | Veo 3.1 | Best overall quality | 5-8s |
| `runway-gen4` | Runway Gen-4.5 | Complex motion | 5-10s |
| `pika-v2` | Pika 2.2 | Fast iteration | 3-4s |
| `wan-video` | Wan 2.6 | Open source, good | 5s |

### Image Generation
| Model ID | Name | Strengths |
|----------|------|-----------|
| `flux-dev` | FLUX.1 Dev | High quality, versatile |
| `flux-schnell` | FLUX.1 Schnell | Ultra fast (1-4 steps) |
| `flux-pro` | FLUX.2 Pro | Best quality |
| `seedream` | Seedream 4.5 | Realistic, high fidelity |

### Analysis & Utilities
| Model ID | Name | Purpose |
|----------|------|---------|
| `depth` | Video Depth Anything | Per-frame depth estimation |
| `upscale` | Topaz Upscale | Video/image upscaling |

## Model Selection Guide

- **Best quality, no budget concern:** `veo3` or `runway-gen4`
- **Human faces/motion:** `kling-v2`
- **Fast iteration/testing:** `flux-schnell` (image) or `kling-v2-turbo` (video)
- **Video with audio:** `ltx-video`
- **Ad content / product shots:** `flux-pro` (image) → `kling-v2` (animate)

## Output

- Videos saved to `/tmp/fal_output/` by default (or `--output /path/to/file`)
- Images returned as URLs + downloaded locally
- All outputs logged with model, prompt, and cost info

## Cost Control

- Start with shortest duration (3-5s) to validate prompts
- Use turbo variants for drafts
- Preview at lower resolution when available
- Download immediately — signed URLs expire (typically 24h)

## API Patterns

All video generation is async:
1. Submit request → get request ID
2. Poll until complete (SDK handles this via `subscribe()`)
3. Download from signed URL

The `fal_generate.py` script handles polling automatically.
