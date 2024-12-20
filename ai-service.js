import { Config } from './config.js';

export class AIClient {
  constructor(provider, apiKey, model) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
    this.prompts = Config.getDefaultPrompts();
  }

  async analyze(changes) {
    const prompt = `${this.prompts.analyze}\n\nChanges:\n${JSON.stringify(
      changes,
      null,
      2
    )}`;
    return this.completion(prompt);
  }

  async completion(prompt) {
    await Config.validateConfig();

    const endpoint =
      this.provider === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : "https://api.anthropic.com/v1/messages";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };

    const body =
      this.provider === "openai"
        ? {
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
          }
        : {
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000,
          };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "API request failed");
      }

      const data = await response.json();
      return this.provider === "openai"
        ? data.choices[0].message.content
        : data.content[0].text;
    } catch (error) {
      console.error("AI API Error:", error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }
}
