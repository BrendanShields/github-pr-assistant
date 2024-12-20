export class Config {
  static async getProvider() {
    const { provider = "openai" } = await chrome.storage.sync.get("provider");
    return provider;
  }

  static async getApiKey() {
    const { apiKey } = await chrome.storage.sync.get("apiKey");
    return apiKey;
  }

  static async getModel() {
    const { model = "gpt-4" } = await chrome.storage.sync.get("model");
    return model;
  }

  static async validateConfig() {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error(
        "API key not configured. Please configure it in the extension settings."
      );
    }
    return true;
  }

  static getDefaultPrompts() {
    return {
      analyze: `Analyze the following PR changes and provide:
          1. A summary of the changes
          2. Potential risks or issues
          3. Suggested improvements
          4. Code quality assessment`,
    };
  }
}
