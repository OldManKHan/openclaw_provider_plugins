import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "aigocode_claude";
const PROVIDER_LABEL = "AIGOCode Claude";
const DEFAULT_MODEL_ID = "claude-opus-4-6";
const DEFAULT_MODEL_NAME = "Claude Opus 4.6";
const DEFAULT_MODEL = `${PROVIDER_ID}/${DEFAULT_MODEL_ID}`;
const DEFAULT_BASE_URL = "https://api.aigocode.com";
const DEFAULT_CONTEXT_WINDOW = 200000;
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
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8192,
  }),
  buildModelDefinition({
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8192,
  }),
  buildModelDefinition({
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8192,
  }),
];

const aigocodeClaudePlugin = {
  id: "aigocode-claude-auth",
  name: "AIGOCode Claude",
  description: "API key authentication for AIGOCode Claude models",
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/aigocode_claude",
      aliases: ["aigocode-anthropic", "aigocode-claude"],
      envVars: ["AIGOCODE_CLAUDE_API_KEY", "AIGOCODE_API_KEY"],
      models: {
        baseUrl: DEFAULT_BASE_URL,
        api: "anthropic-messages",
        models: MODELS,
      },
      auth: [
        {
          id: "api-key",
          label: "AIGOCode Claude API Key",
          hint: "Enter your AIGOCode Claude API key",
          kind: "api_key",
          run: async (ctx) => {
            const key = await ctx.prompter.text({
              message: "Enter your AIGOCode Claude API key",
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
                      api: "anthropic-messages",
                      models: MODELS,
                    },
                  },
                },
                agents: {
                  defaults: {
                    models: {
                      [DEFAULT_MODEL]: { alias: DEFAULT_MODEL_NAME },
                      "aigocode_claude/claude-opus-4-5": {
                        alias: "Claude Opus 4.5",
                      },
                      "aigocode_claude/claude-sonnet-4-5": {
                        alias: "Claude Sonnet 4.5",
                      },
                    },
                  },
                },
              },
              defaultModel: DEFAULT_MODEL,
              notes: [
                "AIGOCode Claude API key configured successfully.",
                `Default model set to ${DEFAULT_MODEL}.`,
                "Endpoint: https://api.aigocode.com",
              ],
            };
          },
        },
      ],
    });
  },
};

export default aigocodeClaudePlugin;
