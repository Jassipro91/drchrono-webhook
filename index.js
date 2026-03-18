const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET = "hubspot123";

// 🔥 VERIFY SIGNATURE FUNCTION
function verifySignature(req) {
  const signature = req.headers["x-drchrono-signature"];
  const body = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("hex");

  return signature === expected || signature === SECRET;
}

// 🔥 WEBHOOK
app.post("/webhook", (req, res) => {
  const event = req.headers["x-drchrono-event"];

  console.log("=================================");
  console.log("Event:", event);
  console.log("Signature:", req.headers["x-drchrono-signature"]);
  console.log("=================================");

  // ✅ VERIFY SIGNATURE
  if (!verifySignature(req)) {
    console.log("❌ Invalid signature");
    return res.sendStatus(401);
  }

  // ✅ HANDLE PING (VERIFICATION)
  if (event === "PING") {
    console.log("✅ PING verified");
    return res.sendStatus(200);
  }

  // ✅ NORMAL EVENTS
  console.log("📩 Data received:", req.body);

  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
