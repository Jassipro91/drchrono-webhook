const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const SECRET = "hubspot123";

// ✅ VERIFY SIGNATURE FUNCTION
function verifySignature(req) {
const signature = req.headers["x-drchrono-signature"];
const body = JSON.stringify(req.body);

const expected = crypto
.createHmac("sha256", SECRET)
.update(body)
.digest("hex");

// allow both (DrChrono sometimes sends plain token during verification)
return signature === expected || signature === SECRET;
}

// ✅ WEBHOOK ROUTE
app.post("/webhook", (req, res) => {
const event = req.headers["x-drchrono-event"];
const signature = req.headers["x-drchrono-signature"];

console.log("=================================");
console.log("📩 Incoming Webhook");
console.log("Event:", event);
console.log("Signature:", signature);
console.log("=================================");

// ❌ INVALID SIGNATURE
if (!verifySignature(req)) {
console.log("❌ Invalid signature");
return res.status(401).end(); // IMPORTANT: empty response
}

// ✅ PING (VERIFICATION)
if (event === "PING") {
console.log("✅ PING verified → sending empty 200 OK");
return res.status(200).end(); // 🔥 MUST BE EMPTY
}

// ✅ NORMAL EVENTS
console.log("📦 Data received:");
console.log(JSON.stringify(req.body, null, 2));

return res.status(200).end(); // 🔥 MUST BE EMPTY
});

// ✅ SERVER START
app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
});
