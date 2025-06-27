// utils/logApiDebug.js

export const logApiSuccess = (response) => {
  const { config, data, status } = response || {};

  console.log("\x1b[35m%s\x1b[0m", "🛰️ API REQUEST INFO");
  console.log("➡️ Method:", config?.method?.toUpperCase());
  console.log("➡️ URL:", config?.baseURL + config?.url);
  console.log("➡️ Headers:", config?.headers);
  if (config?.data) {
    console.log("➡️ Body:", config.data);
  }

  console.log("\x1b[32m%s\x1b[0m", "✅ API RESPONSE");
  console.log("⬅️ Status:", status);
  console.log("⬅️ Response Data:", JSON.stringify(data, null, 2));
};

export const logApiError = (error) => {
  const { config, response, message } = error || {};

  console.log("\x1b[31m%s\x1b[0m", "❌ API ERROR");
  console.log("💥 Message:", message);
  if (config) {
    console.log("➡️ Failed Request:");
    console.log("Method:", config.method?.toUpperCase());
    console.log("URL:", config.baseURL + config.url);
    console.log("Headers:", config.headers);
    if (config.data) {
      console.log("Body:", config.data);
    }
  }
  if (response) {
    console.log("⬅️ Error Response:", JSON.stringify(response?.data, null, 2));
    console.log("⬅️ Status:", response?.status);
  }
};
