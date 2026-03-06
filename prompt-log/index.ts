import fs from "node:fs/promises";
import path from "node:path";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

type PromptLogRecord = {
  ts: string;
  pluginId: string;
  event: {
    runId: string;
    sessionId: string;
    provider: string;
    model: string;
    systemPrompt?: string;
    prompt: string;
    historyMessages: unknown[];
    imagesCount: number;
  };
  ctx: {
    agentId?: string;
    sessionKey?: string;
    sessionId?: string;
    workspaceDir?: string;
    messageProvider?: string;
  };
};

function safeJsonStringify(value: unknown): string | null {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === "bigint") {
        return val.toString();
      }
      if (val instanceof Error) {
        return { name: val.name, message: val.message, stack: val.stack };
      }
      if (val && typeof val === "object") {
        const obj = val as object;
        if (seen.has(obj)) {
          return "[Circular]";
        }
        seen.add(obj);
      }
      return val;
    });
  } catch {
    return null;
  }
}

export default function register(api: OpenClawPluginApi) {
  const stateDir = api.runtime.state.resolveStateDir();
  const logDir = path.join(stateDir, "logs", "prompt");
  let ensureDirPromise: Promise<void> | null = null;
  let writeChain = Promise.resolve();

  const ensureDir = async () => {
    if (!ensureDirPromise) {
      ensureDirPromise = fs.mkdir(logDir, { recursive: true });
    }
    await ensureDirPromise;
  };

  const resolveDailyLogPath = (timestampIso: string): string => {
    const date = timestampIso.slice(0, 10);
    return path.join(logDir, `${date}.jsonl`);
  };

  const enqueueWrite = (line: string, logPath: string) => {
    writeChain = writeChain
      .catch(() => {})
      .then(async () => {
        await ensureDir();
        await fs.appendFile(logPath, line, "utf8");
      })
      .catch((err) => {
        api.logger.warn(`prompt-log: failed to write log entry: ${String(err)}`);
      });
  };

  api.on("llm_input", (event, ctx) => {
    const ts = new Date().toISOString();
    const record: PromptLogRecord = {
      ts,
      pluginId: api.id,
      event: {
        runId: event.runId,
        sessionId: event.sessionId,
        provider: event.provider,
        model: event.model,
        systemPrompt: event.systemPrompt,
        prompt: event.prompt,
        historyMessages: event.historyMessages,
        imagesCount: event.imagesCount,
      },
      ctx: {
        agentId: ctx.agentId,
        sessionKey: ctx.sessionKey,
        sessionId: ctx.sessionId,
        workspaceDir: ctx.workspaceDir,
        messageProvider: ctx.messageProvider,
      },
    };
    const line = safeJsonStringify(record);
    if (!line) {
      api.logger.warn("prompt-log: failed to serialize log entry");
      return;
    }
    enqueueWrite(`${line}\n`, resolveDailyLogPath(ts));
  });
}
