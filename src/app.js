const express = require("express");
const cors = require("cors");
require("dotenv").config();
const functions = require("@google-cloud/functions-framework");
const authRoutes = require("./functions/auth");
const mockRoutes = require("./functions/mocks");
const appointmentRoutes = require("./functions/appointments");
const doctorRoutes = require("./functions/doctors");

const initializeApp = (endpoint, routes) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(endpoint, routes);

  app.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      initializeApp(endpoint, routes);
    } else {
      console.error("Errore del server:", err);
    }
  });

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      status: err.status || 500,
      message: err.message,
    });
  });

  return app;
};

const auth = initializeApp("/api/auth", authRoutes);
const mocks = initializeApp("/api/mocks", mockRoutes);
const doctors = initializeApp("/api/doctors", doctorRoutes);
const appointments = initializeApp("/api/appointments", appointmentRoutes);

functions.http("mocks", mocks);
functions.http("auth", auth);
functions.http("appointments", appointments);
functions.http("doctors", doctors);
