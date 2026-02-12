import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "streamlake";
const PROVIDER_LABEL = "StreamLake (万擎)";
const DEFAULT_MODEL = "streamlake/glm-5";
const DEFAULT_BASE_URL = "https://wanqing.streamlakeapi.com/api/gateway/v1/endpoints";
const DEFAULT_CONTEXT_WINDOW = 200000;
const DEFAULT_MAX_TOKENS = 128000;

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
        id: "glm-5",
        name: "GLM 5",
        input: ["text"],
        contextWindow: 200000,
        maxTokens: 128000,
    }),
    buildModelDefinition({
        id: "minimax-m2.5",
        name: "MiniMax M2.5",
        input: ["text"],
        contextWindow: 200000,
        maxTokens: 128000,
    }),
];

const streamlakePlugin = {
    id: "streamlake-auth",
    name: "StreamLake (万擎)",
    description: "API key authentication for StreamLake (WanQing) models",
    configSchema: emptyPluginConfigSchema(),
    register(api) {
        api.registerProvider({
            id: PROVIDER_ID,
            label: PROVIDER_LABEL,
            docsPath: "/providers/streamlake",
            aliases: ["wq", "wanqing"],
            envVars: ["WQ_API_KEY"],
            models: {
                baseUrl: DEFAULT_BASE_URL,
                api: "openai-completions",
                models: MODELS,
            },
            auth: [
                {
                    id: "api-key",
                    label: "StreamLake API Key",
                    hint: "Enter your StreamLake (WanQing) API key",
                    kind: "api_key",
                    run: async (ctx) => {
                        const key = await ctx.prompter.text({
                            message: "Enter your StreamLake (WanQing) API key",
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
                                            "streamlake/glm-5": { alias: "GLM 5" },
                                            "streamlake/minimax-m2.5": { alias: "MiniMax M2.5" },
                                        },
                                    },
                                },
                            },
                            defaultModel: DEFAULT_MODEL,
                            notes: [
                                "StreamLake (WanQing) API key configured successfully.",
                                `Default model set to ${DEFAULT_MODEL}.`,
                                "Get your API key at: https://wanqing.streamlakeapi.com/",
                            ],
                        };
                    },
                },
            ],
        });
    },
};

export default streamlakePlugin;
