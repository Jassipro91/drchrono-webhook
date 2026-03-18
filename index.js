const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ ROOT CHECK (optional but useful)
app.get("/", (req, res) => {
  res.send("DrChrono webhook server is running");
});

// 🔥 MAIN WEBHOOK ENDPOINT
app.post("/webhook", (req, res) => {
  const event = req.headers["x-drchrono-event"];

  console.log("=================================");
  console.log("📩 Incoming Webhook");
  console.log("Event:", event);
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("=================================");

  // ✅ STEP 1: HANDLE VERIFICATION (PING)
  if (event === "PING") {
    console.log("✅ PING received → Verification success");

    return res.status(200).json({
      status: "ok"
    });
  }

  // ✅ STEP 2: HANDLE REAL EVENTS
  if (event === "APPOINTMENT_CREATE" || event === "APPOINTMENT_MODIFY") {
    console.log("📅 Appointment Event");

    const appointment = req.body;

    console.log("Patient ID:", appointment.patient);
    console.log("Scheduled Time:", appointment.scheduled_time);
    console.log("Reason:", appointment.reason);

    // 👉 Here later we will send data to Zapier
  }

  if (event === "PATIENT_CREATE" || event === "PATIENT_MODIFY") {
    console.log("👤 Patient Event");

    const patient = req.body;

    console.log("Patient Data:", patient);
  }

  // ✅ ALWAYS RETURN 200
  res.status(200).json({ success: true });
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
