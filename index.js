const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const SECRET = "hubspot123"; // SAME as DrChrono

// 🔥 VERIFICATION HANDLER (IMPORTANT)
app.get("/webhook", (req, res) => {
  console.log("Verification request received");

  const msg = req.query.msg;

  if (!msg) {
    return res.status(200).send("No msg");
  }

  const hash = crypto
    .createHmac("sha256", SECRET)
    .update(msg)
    .digest("hex");

  return res.json({
    secrettoken: hash
  });
});

// 🔥 ACTUAL WEBHOOK EVENTS
app.post("/webhook", (req, res) => {
  console.log("Webhook received:");
  console.log(req.body);

  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
