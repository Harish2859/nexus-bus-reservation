const express = require("express");
const cors = require("cors");
require("dotenv").config();
const scheduleRoutes = require("./routes/scheduleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/buses", busRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/debug/schema", async (req, res) => {
  const pool = require("./config/db");
  try {
    const buses = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'buses' ORDER BY ordinal_position`);
    const schedules = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'schedules' ORDER BY ordinal_position`);
    res.json({
      buses: buses.rows.map(r => r.column_name),
      schedules: schedules.rows.map(r => r.column_name)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
