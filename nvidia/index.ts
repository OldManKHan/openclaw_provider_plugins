import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "nvidia";
const PROVIDER_LABEL = "NVIDIA NIM";
const DEFAULT_MODEL = "nvidia/moonshotai/kimi-k2.5";
const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_CONTEXT_WINDOW = 128000;
const DEFAULT_MAX_TOKENS = 4096;

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

const modelDefinitions = [
  // Kimi K2.5 (月之暗面)
  buildModelDefinition({
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    input: ["text", "image"],
    contextWindow: 131072,
    maxTokens: 8192,
  }),
  // GLM 4.7 (智谱)
  buildModelDefinition({
    id: "z-ai/glm4.7",
    name: "GLM 4.7",
    input: ["text", "image"],
    contextWindow: 128000,
    maxTokens: 4096,
  }),
  // MiniMax M2
  buildModelDefinition({
    id: "minimaxai/minimax-m2",
    name: "MiniMax M2",
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 4096,
  }),
];

const nvidiaPlugin = {
  id: "nvidia-auth",
  name: "NVIDIA NIM",
  description: "API key authentication for NVIDIA NIM models",
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/nvidia",
      aliases: ["nim"],
      envVars: ["NVIDIA_API_KEY", "NIM_API_KEY"],
      models: {
        baseUrl: DEFAULT_BASE_URL,
        api: "openai-completions",
        models: modelDefinitions,
      },
      auth: [
        {
          id: "api-key",
          label: "NVIDIA API Key",
          hint: "Enter your NVIDIA NIM API key",
          kind: "api_key",
          run: async (ctx) => {
            const key = await ctx.prompter.text({
              message: "Enter your NVIDIA NIM API key",
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
                      models: modelDefinitions,
                    },
                  },
                },
                agents: {
                  defaults: {
                    models: {
                      "nvidia/moonshotai/kimi-k2.5": { alias: "Kimi K2.5" },
                      "nvidia/z-ai/glm4.7": { alias: "GLM 4.7" },
                      "nvidia/minimaxai/minimax-m2": { alias: "MiniMax M2" },
                    },
                  },
                },
              },
              defaultModel: DEFAULT_MODEL,
              notes: [
                "NVIDIA NIM API key configured successfully.",
                `Default model set to ${DEFAULT_MODEL}.`,
                "Get your API key at: https://build.nvidia.com/",
              ],
            };
          },
        },
      ],
    });
  },
};

export default nvidiaPlugin;
