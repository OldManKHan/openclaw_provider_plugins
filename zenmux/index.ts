import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "zenmux";
const PROVIDER_LABEL = "Zenmux";
const DEFAULT_MODEL = "zenmux/anthropic/claude-opus-4.5";
const DEFAULT_BASE_URL = "https://zenmux.ai/api/v1";
const DEFAULT_CONTEXT_WINDOW = 200000;
const DEFAULT_MAX_TOKENS = 32000;

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
  // Anthropic Claude Opus 4.5
  buildModelDefinition({
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 32000,
  }),
  // OpenAI GPT-5.2 Pro
  buildModelDefinition({
    id: "openai/gpt-5.2-pro",
    name: "GPT-5.2 Pro",
    input: ["text", "image"],
    contextWindow: 128000,
    maxTokens: 16384,
  }),
];

const zenmuxPlugin = {
  id: "zenmux-auth",
  name: "Zenmux",
  description: "API key authentication for Zenmux models",
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/zenmux",
      aliases: ["zm"],
      envVars: ["ZENMUX_API_KEY"],
      models: {
        baseUrl: DEFAULT_BASE_URL,
        api: "openai-completions",
        models: MODELS,
      },
      auth: [
        {
          id: "api-key",
          label: "Zenmux API Key",
          hint: "Enter your Zenmux API key",
          kind: "api_key",
          run: async (ctx) => {
            const key = await ctx.prompter.text({
              message: "Enter your Zenmux API key",
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
                      "zenmux/anthropic/claude-opus-4.5": { alias: "Claude Opus 4.5" },
                      "zenmux/openai/gpt-5.2-pro": { alias: "GPT-5.2 Pro" },
                    },
                  },
                },
              },
              defaultModel: DEFAULT_MODEL,
              notes: [
                "Zenmux API key configured successfully.",
                `Default model set to ${DEFAULT_MODEL}.`,
                "Get your API key at: https://zenmux.ai/",
              ],
            };
          },
        },
      ],
    });
  },
};

export default zenmuxPlugin;
