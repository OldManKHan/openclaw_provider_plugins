# OpenClaw Provider Plugins

本目录包含 OpenClaw 的第三方 AI 模型 Provider 插件和 Skills。

## 可用插件 (Plugins)

| 插件 | Provider ID | 支持模型 |
|------|-------------|----------|
| DeepSeek | `deepseek` | deepseek-chat (V3), deepseek-reasoner (R1) |
| GLM | `glm` | glm-4.7 |
| Kimi | `kimi` | kimi-k2.5, kimi-k2-thinking, moonshot-v1 系列 |
| Aliyun Bailian | `aliyun-bailian` | qwen3-max, kimi-k2.5, glm-4.7, MiniMax-M2.1, deepseek-v3.2 |
| Zenmux | `zenmux` | anthropic/claude-opus-4.6, anthropic/claude-opus-4.5, openai/gpt-5.2-pro |

## 可用技能 (Skills)

| 技能 | 功能 | 依赖 |
|------|------|------|
| zenmux-image-gen-skill | 使用 Gemini 图像模型生成/编辑图片 | uv, ZENMUX_API_KEY |
| bailian-multimodal-skills | 使用阿里云百炼多模态模型 (生图, ASR, TTS) | uv, DASHSCOPE_API_KEY |

## 安装插件 (Plugins)

安装插件分为两步：1) 安装插件 2) 配置 API 认证。可以根据需求选装或者都安装。

```bash
# 安装 deepseek
cd deepseek
openclaw plugins install ./
openclaw models auth login --provider deepseek

# 安装 glm
cd glm
openclaw plugins install ./
openclaw models auth login --provider glm

# 安装 kimi
cd kimi
openclaw plugins install ./
openclaw models auth login --provider kimi

# 安装 aliyun-bailian
cd aliyun-bailian
openclaw plugins install ./
openclaw models auth login --provider aliyun-bailian

# 安装 zenmux
cd zenmux
openclaw plugins install ./
openclaw models auth login --provider zenmux

# 安装完成后重启 gateway 使配置生效
openclaw gateway restart
```

## 安装技能 (Skills)

将技能目录复制到 OpenClaw 的 skills 目录下：

```bash
# 安装 zenmux-image-gen-skill
cp -r zenmux-image-gen-skill/ ~/.openclaw/skills/

# 安装 bailian-multimodal-skills
cp -r bailian-multimodal-skills/ ~/.openclaw/skills/

# 安装 uv (如果未安装)
# macOS
brew install uv
# 或者
curl -LsSf https://astral.sh/uv/install.sh | sh

# 配置 API Key (Zenmux)
export ZENMUX_API_KEY="your-api-key"
# 或者
openclaw config set skills.zenmux-image-gen-skill.apiKey "your-api-key"

# 配置 API Key (Bailian)
export DASHSCOPE_API_KEY="your-api-key"

# 验证安装
openclaw skills info zenmux-image-gen-skill
openclaw skills info bailian-multimodal-skills
```


## 使用模型

配置完成后，可以在 OpenClaw 中使用这些模型：

- 方式1，聊天记录中切换

```bash
# 使用 DeepSeek V3 (Chat)
/models  glm    展示供应商的模型列表

/model glm/glm-4.7  切换到glm-4.7模型

```

- 方式2， 命令行切换

```
 openclaw config   #打开交互切换

 Model : skip for now

 All providers:  选择 glm/glm-4.7 模型， enter 切换
```

- 方式3， 修改配置文件

```
  cd  ~/.openclaw/

  vim openclaw.json

   anents ->  defaults -> model -> primary  修改这个值切换模型
```

## 使用技能 (Skills)

### zenmux-image-gen-skill

生成图片：

```bash
# 在 OpenClaw 对话中，AI 会自动识别并调用此技能
# 例如: "帮我生成一张夕阳下的山脉图片"

# 或者直接运行脚本
uv run ~/.openclaw/skills/zenmux-image-gen-skill/scripts/generate_image.py \
  --prompt "a sunset over mountains" \
  --filename "/tmp/sunset.png"
```

编辑图片：

```bash
uv run ~/.openclaw/skills/zenmux-image-gen-skill/scripts/generate_image.py \
  --prompt "add more vibrant colors" \
  --filename "/tmp/edited.png" \
  -i "/tmp/original.png"
```

多图合成（最多 14 张）：

```bash
uv run ~/.openclaw/skills/zenmux-image-gen-skill/scripts/generate_image.py \
  --prompt "combine these into a collage" \
  --filename "/tmp/collage.png" \
  -i img1.png -i img2.png -i img3.png
```

### bailian-multimodal-skills

1. 生图 (z-image-turbo, wan2.6-t2i):

```bash
uv run ~/.openclaw/skills/bailian-multimodal-skills/scripts/run_multimodal.py \
  --mode image --model z-image-turbo --prompt "future city" --output "city.png"
```

2. ASR (qwen3-asr-flash):

```bash
uv run ~/.openclaw/skills/bailian-multimodal-skills/scripts/run_multimodal.py \
  --mode asr --model qwen3-asr-flash --input-audio "https://example.com/audio.mp3"
```

3. TTS (qwen3-tts-flash):

```bash
uv run ~/.openclaw/skills/bailian-multimodal-skills/scripts/run_multimodal.py \
  --mode tts --model qwen3-tts-flash --text "Hello OpenClaw" --output "hello.wav"
```

可用模型：
- **Image**: `z-image-turbo`, `wan2.6-t2i`
- **ASR**: `qwen3-asr-flash`
- **TTS**: `qwen3-tts-flash`

**注意**: 在 Telegram/Discord 等聊天频道发送生成的图片时，需要使用 `message` 工具的 `filePath` 参数，而不是直接输出 `MEDIA:` 路径文本。
