import { Config } from './config.js';
import { AIClient } from './ai-service.js';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.sync.set({
      provider: "openai",
      model: "gpt-4",
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "analyze") {
    handleAnalysis(request.data)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});

async function handleAnalysis(data) {
  const { provider, apiKey } = await chrome.storage.sync.get(["provider", "apiKey"]);
  if (!apiKey) throw new Error("API key not configured");

  const client = new AIClient(provider, apiKey, await Config.getModel());
  return client.analyze(data.prData);
}