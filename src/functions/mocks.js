const express = require("express");
const router = express.Router();
const { db } = require("../firebaseConfig");
const { faker } = require("@faker-js/faker");
const {
  qualifications,
  specializations,
  hours,
  daysOfWeek,
  role,
  status,
} = require("../types");
const { body, validationResult } = require("express-validator");
const {
  generateResponse,
  generateDate,
  generateRandomDateByDay,
} = require("../utils");
const {
  EMAIL_ALREADY_IN_USE,
  DOCTOR_NOT_FOUND,
  PATIENT_NOT_FOUND,
} = require("../locales");
const { nanoid, random } = require("nanoid");

router.post(
  "/add/doctor",
  [
    body("email").custom(async (value, { req }) => {
      if (!value) {
        return true;
      }

      const docRefs = db.collection("doctors");
      const snapshot = await docRefs.where("email", "==", value).get();

      if (!snapshot.empty) {
        throw new Error(EMAIL_ALREADY_IN_USE);
      }

      const usersRef = db.collection("users");
      const userSnapshot = await usersRef
        .where("email", "==", value)
        .where("role", "==", role.DOCTOR)
        .get();

      if (userSnapshot.empty) {
        throw new Error(DOCTOR_NOT_FOUND);
      }

      req.user = userSnapshot.docs[0].data();
      return true;
    }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (errors.array().length) {
        throw generateResponse(400, errors.array());
      }

      let userId = "DOCTOR" + "_" + nanoid();

      if (req.body.email) {
        const usersRef = db.collection("users");
        const snapshot = await usersRef
          .where("email", "==", req.body.email)
          .get();
        const user = snapshot.docs[0].data();
        userId = user.userId;
      }

      const doctor = {
        name: req?.user?.fullName || faker.person.fullName(),
        userId,
        email: req.body.email ? req.body.email : faker.internet.email(),
        avatar: faker.image.avatar(),
        specialty: faker.helpers.arrayElement(specializations),
        experience: `${faker.number.int({ min: 1, max: 40 })} years`,
        qualifications: [],
        reviews: [],
        availability: [],
      };

      daysOfWeek.forEach((day) => {
        const dayAvailability = {
          day: day,
          hours: [],
        };
        const availabilityCount = faker.number.int({
          min: 1,
          max: hours.length,
        });
        for (let i = 0; i < availabilityCount; i++) {
          let hour;
          do {
            hour = faker.helpers.arrayElement(hours);
          } while (dayAvailability.hours.includes(hour));
          dayAvailability.hours.push(hour);
        }
        dayAvailability.hours.sort();
        doctor.availability.push(dayAvailability);
      });

      const qualificationsCount = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < qualificationsCount; i++) {
        doctor.qualifications.push(faker.helpers.arrayElement(qualifications));
      }

      const reviewsCount = faker.number.int({ min: 5, max: 20 });
      for (let i = 0; i < reviewsCount; i++) {
        const review = {
          patient: faker.person.firstName(),
          date: faker.date.past().toLocaleDateString(),
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
        };
        doctor.reviews.push(review);
      }

      await db.collection("doctors").add(doctor);

      res.status(201).send(generateResponse(201, doctor));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/add/appointments",
  [body("patientUserId").notEmpty(), body("doctorUserId").notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (errors.array().length) {
        throw generateResponse(400, errors.array());
      }

      const { doctorUserId, patientUserId } = req.body;

      const doctorsRef = doctorUserId
        ? await db
            .collection("doctors")
            .where("userId", "==", doctorUserId)
            .get()
        : await db.collection("doctors").get();

      if (doctorsRef.empty) {
        throw generateResponse(404, DOCTOR_NOT_FOUND);
      }

      const usersRef = await db
        .collection("users")
        .where("userId", "==", patientUserId)
        .get();

      if (usersRef.empty) {
        throw generateResponse(404, PATIENT_NOT_FOUND);
      }

      const user = usersRef.docs[0].data();

      const doctors = doctorsRef.docs.map((d) => d.data());
      const availableSlots = [];

      doctors.forEach((doctor) => {
        doctor.availability.forEach((dayAvailability) => {
          dayAvailability.hours.forEach((hour) => {
            availableSlots.push({
              name: doctor.name,
              doctorUserId: doctor.userId,
              day: dayAvailability.day,
              hour,
            });
          });
        });
      });

      const selectedSlots = faker.helpers.shuffle(availableSlots).slice(0, 5);
      const appointments = selectedSlots.map((slot) => {
        const date = generateRandomDateByDay(slot.day, slot.hour);
        const statuses = Object.values(status);
        const randomIndex = Math.floor(Math.random() * statuses.length);
        const appointmentStatus =
          date > new Date() ? status.UPCOMING : statuses[randomIndex];

        return {
          doctorUserId: slot.doctorUserId,
          doctorName: slot.name,
          patientUserId: patientUserId,
          patientName: user.fullName,
          status: appointmentStatus,
          appointmentId: "APPOINTMENT" + "_" + nanoid(),
          createdAt: generateDate(),
          date: generateRandomDateByDay(slot.day, slot.hour),
        };
      });

      for (const appointment of appointments) {
        await db.collection("appointments").add(appointment);
      }

      res.status(201).send(generateResponse(201, appointments));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
