// Import from your config file
const { Sentry } = require("../config/sentry");

const testSentry = (req, res) => {
  console.log("🔧 Sentry test endpoint called");

  try {
    // Create a test error
    const testError = new Error(
      "🚨 TEST ERROR from Tuk-Tuk API - " + new Date().toISOString(),
    );

    // Send to Sentry
    if (Sentry && typeof Sentry.captureException === "function") {
      Sentry.captureException(testError);
      console.log("✅ Error sent to Sentry successfully");
    } else {
      console.log("❌ Sentry.captureException is not available");
    }

    res.json({
      success: true,
      message:
        "Test error sent to Sentry! Check your dashboard in 1-2 minutes.",
      error: testError.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to send to Sentry:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send test error to Sentry",
      error: error.message,
    });
  }
};

module.exports = { testSentry };
