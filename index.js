const express = require("express");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 10000;
const SECRET = "hubspot123";

// ✅ WEBHOOK ROUTE (RAW BODY REQUIRED)
app.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
const rawBody = req.body;
const event = req.headers["x-drchrono-event"];
const signature = req.headers["x-drchrono-signature"];

console.log("=================================");
console.log("📩 Incoming Webhook");
console.log("Event:", event);
console.log("Signature:", signature);
console.log("=================================");

// ✅ VERIFY SIGNATURE
let isValid = false;

try {
const expected = crypto
.createHmac("sha256", SECRET)
.update(rawBody)
.digest("hex");

```
if (signature === expected || signature === SECRET) {
  isValid = true;
}
```

} catch (err) {
console.log("⚠️ Signature error:", err.message);
}

if (!isValid) {
console.log("❌ Invalid signature");
return res.status(401).end();
}

// ✅ HANDLE VERIFICATION (PING)
if (event === "PING") {
console.log("✅ PING verified → sending empty 200");
return res.status(200).end(); // 🔥 IMPORTANT
}

// ✅ NORMAL EVENTS
let data = {};
try {
data = JSON.parse(rawBody.toString());
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
