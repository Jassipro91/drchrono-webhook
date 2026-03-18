// index.js
const express = require("express");
const crypto = require("crypto");

const app = express();

// other routes (if any) can use JSON normally
app.use(express.json());

// Use raw body parser ONLY for the webhook route to preserve exact bytes for HMAC
const rawBodyMiddleware = express.raw({ type: "*/*", limit: "1mb" });

const PORT = process.env.PORT || 3000;
// Use environment variable SECRET (set this in Render). Fallback for local testing:
const SECRET = process.env.SECRET || "hubspot123";

/**
 * Constant-time compare
 */
function safeEqual(a, b) {
  try {
    const bufA = Buffer.from(String(a || ""), "utf8");
    const bufB = Buffer.from(String(b || ""), "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

/**
 * Verify signature:
 * - DrChrono sometimes sends the raw secret token in header x-drchrono-signature
 * - Or it may send a HMAC-SHA256 hex digest of the raw body
 * We accept either (header === SECRET) OR (header === hex(hmacSHA256(rawBody, SECRET)))
 */
function verifySignature(rawBuffer, signatureHeader) {
  if (!signatureHeader) return false;

  // Accept direct token match first (simple)
  if (safeEqual(signatureHeader, SECRET)) return true;

  // Compute HMAC-SHA256(hex) of raw bytes
  const hmac = crypto.createHmac("sha256", SECRET).update(rawBuffer).digest("hex");
  if (safeEqual(signatureHeader, hmac)) return true;

  return false;
}

/**
 * Webhook endpoint — use raw parser so HMAC is correct
 */
app.post("/webhook", rawBodyMiddleware, (req, res) => {
  try {
    const raw = req.body; // Buffer
    const headers = req.headers;
    const event = headers["x-drchrono-event"] || headers["x-drchrono-event".toLowerCase()];
    const signature = headers["x-drchrono-signature"] || "";

    console.log("=================================");
    console.log("📩 Incoming Webhook");
    console.log("Event:", event);
    console.log("Signature:", signature);
    console.log("=================================");

    // Verify signature
    const verified = verifySignature(raw, signature);
    if (!verified) {
      console.log("❌ Signature verification failed");
      return res.sendStatus(401);
    }

    // PING verification (Dr.Chrono uses PING for verifying webhooks)
    if (String(event).toUpperCase() === "PING") {
      console.log("✅ PING verified");
      // DrChrono expects a 200 OK (no body). Send 200 with no JSON body.
      return res.status(200).end();
    }

    // Try to parse JSON payload (safe)
    let bodyJson = null;
    try {
      bodyJson = raw && raw.length ? JSON.parse(raw.toString("utf8")) : null;
    } catch (e) {
      console.log("⚠️ Warning: failed to parse JSON body:", e && e.message);
    }

    // Log the event and payload for debugging
    console.log("📥 Event:", event);
    console.log("📦 Payload:", JSON.stringify(bodyJson, null, 2));

    // TODO: here you can forward to Zapier (catch hook URL) or process however you like.
    // Example: POST to Zapier catch URL (uncomment and add axios if you want)
    // const axios = require('axios');
    // await axios.post(process.env.ZAPIER_URL, bodyJson || raw, { headers: { 'Content-Type': 'application/json' } });

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❗ Error handling webhook:", err);
    return res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("Webhook listener running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
