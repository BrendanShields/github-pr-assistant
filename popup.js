document.addEventListener("DOMContentLoaded", async () => {
  // Load saved settings
  const { provider, apiKey, model } = await chrome.storage.sync.get([
    "provider",
    "apiKey",
    "model",
  ]);

  if (provider) document.getElementById("provider").value = provider;
  if (apiKey) document.getElementById("apiKey").value = apiKey;
  if (model) document.getElementById("model").value = model;

  // Save settings
  document.getElementById("save").addEventListener("click", async () => {
    const settings = {
      provider: document.getElementById("provider").value,
      apiKey: document.getElementById("apiKey").value,
      model: document.getElementById("model").value,
    };

    try {
      await chrome.storage.sync.set(settings);
      showStatus("Settings saved successfully!", "success");
    } catch (error) {
      showStatus("Error saving settings: " + error.message, "error");
    }
  });

  // Update model options based on provider
  document.getElementById("provider").addEventListener("change", (e) => {
    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = "";

    if (e.target.value === "openai") {
      modelSelect.innerHTML = `
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        `;
    } else {
      modelSelect.innerHTML = `
          <option value="claude-3">Claude 3</option>
        `;
    }
  });
});

function showStatus(message, type) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status status-${type}`;
  status.style.display = "block";

  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}
