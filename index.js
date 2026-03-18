const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Health check (optional)
app.get("/", (req, res) => {
  res.send("DrChrono webhook server running");
});

// 🔥 MAIN WEBHOOK
app.post("/webhook", (req, res) => {
  const event = req.headers["x-drchrono-event"];

  console.log("=================================");
  console.log("📩 Incoming Webhook");
  console.log("Event:", event);
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("=================================");

  // ✅ FINAL FIX: PING VERIFICATION (EMPTY 200 RESPONSE)
  if (event === "PING") {
    console.log("✅ PING received → sending 200 OK (no body)");
    return res.sendStatus(200); // 🔥 THIS IS THE KEY
  }

  // ✅ HANDLE APPOINTMENT EVENTS
  if (event === "APPOINTMENT_CREATE" || event === "APPOINTMENT_MODIFY") {
    const appointment = req.body;

    console.log("📅 Appointment Event");
    console.log("Patient ID:", appointment.patient);
    console.log("Scheduled Time:", appointment.scheduled_time);
    console.log("Reason:", appointment.reason);
  }

  // ✅ HANDLE PATIENT EVENTS
  if (event === "PATIENT_CREATE" || event === "PATIENT_MODIFY") {
    console.log("👤 Patient Event");
    console.log(req.body);
  }

  // ✅ ALWAYS RESPOND SUCCESS
  return res.sendStatus(200);
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
