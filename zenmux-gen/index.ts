import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "zenmux-gen";
const PROVIDER_LABEL = "Zenmux Gen";
const DEFAULT_MODEL = "zenmux-gen/google/gemini-3-pro-image-preview";
const DEFAULT_BASE_URL = "https://zenmux.ai/api/vertex-ai/v1";
const DEFAULT_CONTEXT_WINDOW = 1000000;
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
  // Google Gemini 3 Pro Image Preview
  buildModelDefinition({
    id: "google/gemini-3-pro-image-preview",
    name: "Gemini 3 Pro Image Preview",
    input: ["text", "image"],
    contextWindow: 1000000,
    maxTokens: 8192,
  }),
];

const zenmuxGenPlugin = {
  id: "zenmux-gen-auth",
  name: "Zenmux Gen",
  description: "API key authentication for Zenmux Gen models (Vertex AI)",
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/zenmux-gen",
      aliases: ["zmg", "zenmux-vertex"],
      envVars: ["ZENMUX_GEN_API_KEY"],
      models: {
        baseUrl: DEFAULT_BASE_URL,
        api: "openai-completions",
        models: MODELS,
      },
      auth: [
        {
          id: "api-key",
          label: "Zenmux Gen API Key",
          hint: "Enter your Zenmux API key for Vertex AI models",
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
                      "zenmux-gen/google/gemini-3-pro-image-preview": { alias: "Gemini 3 Pro Image" },
                    },
                  },
                },
              },
              defaultModel: DEFAULT_MODEL,
              notes: [
                "Zenmux Gen API key configured successfully.",
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

export default zenmuxGenPlugin;
