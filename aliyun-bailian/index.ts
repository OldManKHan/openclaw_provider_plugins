import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "aliyun-bailian";
const PROVIDER_LABEL = "Aliyun Bailian (阿里云百炼)";
const DEFAULT_MODEL = "qwen3-max";
const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_CONTEXT_WINDOW = 32768; // Conservative default, adjusting per model below
const DEFAULT_MAX_TOKENS = 8192;

function buildModelDefinition(params: {
  id: string;
  name: string;
  input: Array<"text" | "image">;
  contextWindow?: number;
  maxTokens?: number;
  reasoning?: boolean;
}) {
  return {
    id: params.id,
    name: params.name,
    reasoning: params.reasoning ?? false,
    input: params.input,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: params.contextWindow ?? DEFAULT_CONTEXT_WINDOW,
    maxTokens: params.maxTokens ?? DEFAULT_MAX_TOKENS,
  };
}

const MODELS = [
  buildModelDefinition({
    id: "qwen3-max",
    name: "Qwen 3 Max",
    input: ["text"],
    contextWindow: 32768,
    maxTokens: 8192,
  }),
  buildModelDefinition({
    id: "kimi-k2.5",
    name: "Kimi k2.5",
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 8192,
  }),
  buildModelDefinition({
    id: "glm-4.7",
    name: "GLM 4.7",
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 8192,
  }),
  buildModelDefinition({
    id: "MiniMax-M2.1",
    name: "MiniMax M2.1",
    input: ["text"],
    contextWindow: 32768,
    maxTokens: 8192,
  }),
  buildModelDefinition({
    id: "deepseek-v3.2",
    name: "DeepSeek V3.2",
    input: ["text"],
    contextWindow: 65536,
    maxTokens: 8192,
  }),
];

const bailianPlugin = {
  id: "aliyun-bailian-auth",
  name: "Aliyun Bailian (阿里云百炼)",
  description: "API key authentication for Aliyun Bailian models",
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/aliyun-bailian",
      aliases: ["bailian", "qw"],
      envVars: ["DASHSCOPE_API_KEY"],
      models: {
        baseUrl: DEFAULT_BASE_URL,
        api: "openai-completions",
        models: MODELS,
      },
      auth: [
        {
          id: "api-key",
          label: "DashScope API Key",
          hint: "Enter your DashScope API key",
          kind: "api_key",
          run: async (ctx) => {
            const key = await ctx.prompter.text({
              message: "Enter your DashScope API key",
              validate: (value) => {
                if (!value?.trim()) return "API key is required";
                return undefined;
              },
            });

            const apiKey = String(key).trim();
            const profileId = `${PROVIDER_ID}:default`;

            return {
              profiles: [
                {
                  profileId,
                  credential: {
                    type: "api_key",
                    provider: PROVIDER_ID,
                    key: apiKey,
                  },
                },
              ],
              configPatch: {
                models: {
                  providers: {
                    [PROVIDER_ID]: {
                      baseUrl: DEFAULT_BASE_URL,
                      api: "openai-completions",
                      models: MODELS,
                    },
                  },
                },
                agents: {
                  defaults: {
                    models: {
                      "qwen3-max": { alias: "Qwen 3 Max" },
                      "kimi-k2.5": { alias: "Kimi k2.5" },
                      "glm-4.7": { alias: "GLM 4.7" },
                      "MiniMax-M2.1": { alias: "MiniMax M2.1" },
                      "deepseek-v3.2": { alias: "DeepSeek V3.2" },
                    },
                  },
                },
              },
              defaultModel: DEFAULT_MODEL,
              notes: [
                "DashScope API key configured successfully.",
                `Default model set to ${DEFAULT_MODEL}.`,
                "Get your API key at: https://dashscope.console.aliyun.com/",
              ],
            };
          },
        },
      ],
    });
  },
};

export default bailianPlugin;
