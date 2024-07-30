const express = require("express");
const router = express.Router();
const { db } = require("../firebaseConfig");
const { body, validationResult, header } = require("express-validator");
const {
  generateResponse,
  generateDate,
  validateAuthentication,
  getDayName,
  getHour,
  validatePatient,
  validateDoctor,
} = require("../utils");
const {
  DOCTOR_NOT_FOUND,
  DOCTOR_NOT_AVAILABLE,
  INVALID_DATE,
  APPOINTMENT_ALREADY_TAKEN,
  APPOINTMENTS_NOT_FOUND,
} = require("../locales");
const { nanoid } = require("nanoid");
const { role, status } = require("../types");

router.get("/all", validateAuthentication, async (req, res, next) => {
  try {
    const usersRef = db.collection("appointments");
    const userId =
      req.user.role == role.DOCTOR ? "doctorUserId" : "patientUserId";
    const snapshot = await usersRef.where(userId, "==", req.user.userId).get();

    if (snapshot.empty) {
      throw generateResponse(404, APPOINTMENTS_NOT_FOUND);
    }

    const appointments = snapshot.docs.map((doc) => doc.data());
    return res.status(200).send(generateResponse(200, appointments));
  } catch (error) {
    next(error);
  }
});

router.post(
  "/create",
  [
    [
      validateAuthentication,
      validatePatient,
      body("date")
        .notEmpty()
        .custom((value) => {
          const date = new Date(value);
          const today = new Date();

          if (today > date) {
            throw new Error(INVALID_DATE);
          } else {
            return true;
          }
        }),
      body("doctorUserId").notEmpty(),
    ],
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (errors.array().length) {
        throw generateResponse(400, errors.array());
      }

      const patientUserId = req.user.userId;
      const { doctorUserId, date } = req.body;

      const day = getDayName(date);
      const hour = getHour(date);

      const usersRef = db.collection("doctors");
      const snapshot = await usersRef.where("userId", "==", doctorUserId).get();
      if (snapshot.empty) {
        throw generateResponse(404, DOCTOR_NOT_FOUND);
      }

      const user = snapshot.docs[0].data();
      const availability = user.availability.filter(
        (a) => a.day === day && a.hours.includes(hour)
      );
      const doctorName = user.name;
      const doctorEmail = user.email;

      if (!availability.length) {
        throw generateResponse(400, DOCTOR_NOT_AVAILABLE);
      }

      const appointmentSnapshot = await db
        .collection("appointments")
        .where("doctorUserId", "==", doctorUserId)
        .where("date", "==", date)
        .get();

      if (!appointmentSnapshot.empty) {
        throw generateResponse(400, APPOINTMENT_ALREADY_TAKEN);
      }

      const appointment = {
        appointmentId: "APPOINTMENT" + "_" + nanoid(),
        doctorUserId,
        patientUserId,
        date,
        patientName: req.user.fullName,
        patientEmail: req.user.email,
        doctorName,
        doctorEmail,
        status: status.UPCOMING,
        createdAt: generateDate(),
      };

      await db.collection("appointments").add(appointment);
      res.status(200).send(generateResponse(201, appointment));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
