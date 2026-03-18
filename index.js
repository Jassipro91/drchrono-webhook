const express = require("express");
const app = express();

// Middleware to read JSON body
app.use(express.json());

// Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("Webhook server is running");
});

// 🔥 MAIN WEBHOOK ENDPOINT
app.post("/webhook", (req, res) => {
  console.log("Webhook received:");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  // ✅ IMPORTANT: This response is REQUIRED for DrChrono verification
  res.status(200).json({
    status: "verified"
  });
});

// Use dynamic port (VERY IMPORTANT for Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
