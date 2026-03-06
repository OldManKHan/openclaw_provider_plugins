# Prompt Log (OpenClaw plugin)

Logs OpenClaw `llm_input` context to JSONL files under the state logs directory.

## Install

From a source checkout:

```bash
openclaw plugins install ./extensions/prompt-log
```

Enable it if your config uses explicit allowlists:

```bash
openclaw plugins enable prompt-log
```

Restart or reload the gateway after enabling the plugin.

## Output

By default the plugin writes to daily JSONL files in:

```
<stateDir>/logs/prompt/YYYY-MM-DD.jsonl
```

Each line is a JSON object containing the timestamp, `llm_input` event data, and agent context.

## Viewer (HTML)

Open the static viewer file in your browser and load one or more daily log files:

```
extensions/prompt-log/viewer/index.html
```
