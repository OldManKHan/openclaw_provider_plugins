---
name: bailian-multimodal-skills
description: Generate images, speech, and transcribe audio using Aliyun Bailian models.
homepage: https://dashscope.aliyun.com
metadata:
  {
    "openclaw":
      {
        "emoji": "🎭",
        "requires": { "bins": ["uv"], "env": ["DASHSCOPE_API_KEY"] },
        "primaryEnv": "DASHSCOPE_API_KEY",
        "install":
          [
            {
              "id": "uv-brew",
              "kind": "brew",
              "formula": "uv",
              "bins": ["uv"],
              "label": "Install uv (brew)",
            },
            {
              "id": "uv-curl",
              "kind": "download",
              "url": "https://astral.sh/uv/install.sh",
              "bins": ["uv"],
              "label": "Install uv (curl)",
            },
          ],
      },
  }
---

# Bailian Multimodal Skills

Generate images, audio, and transcribe speech using Aliyun Bailian (Qwen/Wan/CosyVoice) models.

## Features

- **Image Generation**: `z-image-turbo`, `wan2.6-t2i`
- **ASR (Speech-to-Text)**: `qwen3-asr-flash`
- **TTS (Text-to-Speech)**: `qwen3-tts-flash`

## Usage

### 1. Image Generation

Generate images from text.

```bash
uv run {baseDir}/scripts/run_multimodal.py --mode image --model z-image-turbo --prompt "A futuristic city" --output "city.png"
```

Models: `z-image-turbo`, `wan2.6-t2i`

### 2. ASR (Speech Recognition)

Transcribe audio files or URLs to text.

```bash
uv run {baseDir}/scripts/run_multimodal.py --mode asr --model qwen3-asr-flash --input-audio "https://example.com/audio.mp3"
```

### 3. TTS (Speech Synthesis)

Convert text to speech.

```bash
uv run {baseDir}/scripts/run_multimodal.py --mode tts --model qwen3-tts-flash --text "Hello world" --output "hello.wav"
```

## Configuration

Set `DASHSCOPE_API_KEY` environment variable.

```bash
export DASHSCOPE_API_KEY="sk-..."
```
