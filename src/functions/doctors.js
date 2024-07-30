const express = require("express");
const router = express.Router();
const { db } = require("../firebaseConfig");
const {
  generateResponse,
  validateAuthentication,
  validatePatient,
} = require("../utils");
const { DOCTOR_NOT_FOUND } = require("../locales");

router.get(
  "/all",
  [validateAuthentication, validatePatient],
  async (req, res, next) => {
    try {
      const doctorRef = await db.collection("doctors").get();

      if (doctorRef.empty) {
        throw generateResponse(404, DOCTOR_NOT_FOUND);
      }

      const doctors = doctorRef.docs.map((doc) => doc.data());
      return res.status(200).send(generateResponse(200, doctors));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
