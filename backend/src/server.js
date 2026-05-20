const express = require("express");
const cors = require("cors");
require("dotenv").config();
const scheduleRoutes = require("./routes/scheduleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/schedules", scheduleRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
