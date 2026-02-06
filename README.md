# OpenClaw Provider Plugins

本目录包含 OpenClaw 的第三方 AI 模型 Provider 插件和 Skills。

## 可用插件 (Plugins)

| 插件 | Provider ID | 支持模型 |
|------|-------------|----------|
| DeepSeek | `deepseek` | deepseek-chat (V3), deepseek-reasoner (R1) |
| GLM | `glm` | glm-4.7 |
| Kimi | `kimi` | kimi-k2.5, kimi-k2-thinking, moonshot-v1 系列 |
| Zenmux | `zenmux` | anthropic/claude-opus-4.6, anthropic/claude-opus-4.5, openai/gpt-5.2-pro |

## 可用技能 (Skills)

| 技能 | 功能 | 依赖 |
|------|------|------|
| zenmux-image-gen-skill | 使用 Gemini 图像模型生成/编辑图片 | uv, ZENMUX_API_KEY |

## 安装插件 (Plugins)

将插件目录复制到 OpenClaw 的 plugins 目录下：（可以根据需求选装或者都安装）

```bash
# 安装deepseek
cd deepseek
openclaw plugins install ./

# 安装glm
cd glm
openclaw plugins install ./

# 安装kimi
cd kimi
openclaw plugins install ./

# 安装zenmux
cd zenmux
openclaw plugins install ./

# 安装完成重启一次

# 重启当前运行的 gateway
openclaw gateway restart
```

## 安装技能 (Skills)

将技能目录复制到 OpenClaw 的 skills 目录下：

```bash
# 安装 zenmux-image-gen-skill
cp -r zenmux-image-gen-skill ~/.openclaw/skills/

# 安装 uv (如果未安装)
# macOS
brew install uv
# 或者
curl -LsSf https://astral.sh/uv/install.sh | sh

# 配置 API Key
export ZENMUX_API_KEY="your-api-key"
# 或者
openclaw config set skills.zenmux-image-gen-skill.apiKey "your-api-key"

# 验证安装
openclaw skills info zenmux-image-gen-skill
```


## 配置 API

1. 运行 OpenClaw 的认证配置命令，按提示输入 API Key：

```bash
openclaw models auth login --provider kimi

openclaw models auth login --provider glm

openclaw models auth login --provider deepseek

openclaw models auth login --provider zenmux
```


## 重启 Gateway

配置完成后，需要重启 OpenClaw Gateway 使配置生效：

```bash
# 重启当前运行的 gateway
openclaw gateway restart

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

可用模型：
- `google/gemini-3-pro-image-preview` (默认，最高质量)
- `google/gemini-3-pro-image-preview-free` (免费版)
- `google/gemini-2.5-flash-image` (更快)
- `google/gemini-2.5-flash-image-free` (免费版，更快)

**注意**: 在 Telegram/Discord 等聊天频道发送生成的图片时，需要使用 `message` 工具的 `filePath` 参数，而不是直接输出 `MEDIA:` 路径文本。
