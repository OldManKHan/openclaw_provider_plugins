import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const PROVIDER_ID = "custom";
const PROVIDER_LABEL = "Custom (自定义 OpenAI 兼容)";
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

// 默认提供一个通用模型定义，用户可以在配置时指定实际的模型名称
const DEFAULT_MODELS = [
  buildModelDefinition({
    id: "default",
    name: "Default Model",
    input: ["text"],
    contextWindow: DEFAULT_CONTEXT_WINDOW,
    maxTokens: DEFAULT_MAX_TOKENS,
  }),
];

const customPlugin = {
  id: "custom-auth",
  name: "Custom (自定义 OpenAI 兼容)",
  description: "Custom OpenAI-compatible API provider - configure your own baseURL and API key",
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/custom",
      aliases: ["openai-compatible", "oc"],
      envVars: ["CUSTOM_API_KEY", "CUSTOM_BASE_URL"],
      models: {
        baseUrl: "", // 将由用户配置
        api: "openai-completions",
        models: DEFAULT_MODELS,
      },
      auth: [
        {
          id: "api-key-and-url",
          label: "Custom API Configuration",
          hint: "Configure your custom OpenAI-compatible API endpoint",
          kind: "api_key",
          run: async (ctx) => {
            // 1. 获取 Base URL
            const baseUrlInput = await ctx.prompter.text({
              message: "Enter your API Base URL (e.g., https://api.example.com/v1)",
              validate: (value) => {
                if (!value?.trim()) return "Base URL is required";
                try {
                  new URL(value.trim());
                  return undefined;
                } catch {
                  return "Please enter a valid URL";
                }
              },
            });
            const baseUrl = String(baseUrlInput).trim();

            // 2. 获取 API Key
            const keyInput = await ctx.prompter.text({
              message: "Enter your API key",
              validate: (value) => {
                if (!value?.trim()) return "API key is required";
                return undefined;
              },
            });
            const apiKey = String(keyInput).trim();

            // 3. 获取模型名称
            const modelIdInput = await ctx.prompter.text({
              message: "Enter the model ID to use (e.g., gpt-4, claude-3, qwen-max)",
              validate: (value) => {
                if (!value?.trim()) return "Model ID is required";
                return undefined;
              },
            });
            const modelId = String(modelIdInput).trim();

            // 4. 获取模型显示名称（可选）
            const modelNameInput = await ctx.prompter.text({
              message: "Enter a display name for this model (optional, press Enter to use model ID)",
              validate: () => undefined,
            });
            const modelName = String(modelNameInput).trim() || modelId;

            // 5. 获取上下文窗口大小（可选）
            const contextWindowInput = await ctx.prompter.text({
              message: "Enter context window size (optional, default: 128000)",
              validate: (value) => {
                if (!value?.trim()) return undefined;
                const num = parseInt(value.trim(), 10);
                if (isNaN(num) || num <= 0) return "Please enter a valid positive number";
                return undefined;
              },
            });
            const contextWindow = contextWindowInput?.trim()
              ? parseInt(String(contextWindowInput).trim(), 10)
              : DEFAULT_CONTEXT_WINDOW;

            // 6. 询问是否是推理模型
            const isReasoningInput = await ctx.prompter.select({
              message: "Is this a reasoning model (like DeepSeek R1, o1)?",
              choices: [
                { name: "No", value: "no" },
                { name: "Yes", value: "yes" },
              ],
            });
            const isReasoning = isReasoningInput === "yes";

            // 构建模型定义
            const models = [
              buildModelDefinition({
                id: modelId,
                name: modelName,
                input: ["text"],
                contextWindow,
                maxTokens: DEFAULT_MAX_TOKENS,
                reasoning: isReasoning,
              }),
            ];

            const profileId = `${PROVIDER_ID}:default`;
            const defaultModel = `${PROVIDER_ID}/${modelId}`;

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
                      baseUrl,
                      api: "openai-completions",
                      models,
                    },
                  },
                },
                agents: {
                  defaults: {
                    models: {
                      [defaultModel]: { alias: modelName },
                    },
                  },
                },
              },
              defaultModel,
              notes: [
                "Custom API configured successfully.",
                `Base URL: ${baseUrl}`,
                `Model: ${modelId}${isReasoning ? " (Reasoning)" : ""}`,
                `Default model set to ${defaultModel}.`,
              ],
            };
          },
        },
      ],
    });
  },
};

export default customPlugin;
