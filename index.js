const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;
const SECRET = "hubspot123";

// ✅ RAW BODY (no parsing issues)
app.post("/webhook", express.text({ type: "*/*" }), (req, res) => {
const event = req.headers["x-drchrono-event"];
const signature = req.headers["x-drchrono-signature"];

console.log("=================================");
console.log("📩 Incoming Webhook");
console.log("Event:", event);
console.log("Signature:", signature);
console.log("=================================");

// ✅ SIMPLE VALIDATION (NO CRYPTO)
if (signature !== SECRET) {
console.log("❌ Invalid signature");
return res.status(401).end();
}

// ✅ PING (VERIFICATION)
if (event === "PING") {
console.log("✅ PING verified → sending empty 200");
return res.status(200).end(); // 🔥 CRITICAL
}

// ✅ NORMAL EVENTS
let data = {};
try {
data = JSON.parse(req.body);
} catch (e) {
console.log("⚠️ JSON parse failed");
}

console.log("📦 Data:", data);

return res.status(200).end();
});

// Health check
app.get("/", (req, res) => {
res.send("Server running");
});

app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
});
