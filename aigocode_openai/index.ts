import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "aigocode_openai";
const PROVIDER_LABEL = "AIGOCode OpenAI";
const MODEL_ID = "gpt-5.3-codex";
const MODEL_NAME = "GPT-5.3 Codex";
const DEFAULT_MODEL = `${PROVIDER_ID}/${MODEL_ID}`;
const DEFAULT_BASE_URL = "https://api.aigocode.com/v1";
const DEFAULT_CONTEXT_WINDOW = 128000;
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
    id: MODEL_ID,
    name: MODEL_NAME,
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 8192,
  }),
];

const aigocodeOpenaiPlugin = {
  id: "aigocode-openai-auth",
  name: "AIGOCode OpenAI",
  description: "API key authentication for AIGOCode OpenAI models",
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/aigocode_openai",
      aliases: ["aigocode-gpt", "aigocode-openai"],
      envVars: ["AIGOCODE_OPENAI_API_KEY", "AIGOCODE_API_KEY"],
      models: {
        baseUrl: DEFAULT_BASE_URL,
        api: "openai-response",
        models: MODELS,
      },
      auth: [
        {
          id: "api-key",
          label: "AIGOCode OpenAI API Key",
          hint: "Enter your AIGOCode OpenAI API key",
          kind: "api_key",
          run: async (ctx) => {
            const key = await ctx.prompter.text({
              message: "Enter your AIGOCode OpenAI API key",
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
                      api: "openai-response",
                      models: MODELS,
                    },
                  },
                },
                agents: {
                  defaults: {
                    models: {
                      [DEFAULT_MODEL]: { alias: MODEL_NAME },
                    },
                  },
                },
              },
              defaultModel: DEFAULT_MODEL,
              notes: [
                "AIGOCode OpenAI API key configured successfully.",
                `Default model set to ${DEFAULT_MODEL}.`,
                "Endpoint: https://api.aigocode.com/v1",
              ],
            };
          },
        },
      ],
    });
  },
};

export default aigocodeOpenaiPlugin;
