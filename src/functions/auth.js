const express = require("express");
const router = express.Router();
const { db } = require("../firebaseConfig");
const { body, validationResult } = require("express-validator");
const { generateResponse, generateDate, generateToken } = require("../utils");
const bcrypt = require("bcrypt");
const {
  PASSWORD_VALIDATION_ERROR,
  ROLE_VALIDATION_ERROR,
  EMAIL_ALREADY_IN_USE,
  EMAIL_NOT_FOUND,
  PASSWORD_NOT_MATCH,
  SUCCESS,
} = require("../locales");
const { nanoid } = require("nanoid");

router.post(
  "/signup",
  [
    [
      body("fullName").notEmpty(),
      body("role")
        .isIn(["PATIENT", "DOCTOR"])
        .withMessage(ROLE_VALIDATION_ERROR),
      body("email")
        .isEmail()
        .custom(async (value) => {
          const usersRef = db.collection("users");
          const snapshot = await usersRef.where("email", "==", value).get();
          if (!snapshot.empty) {
            throw new Error(EMAIL_ALREADY_IN_USE);
          }
          return true;
        }),
      body("password")
        .notEmpty()
        .isStrongPassword()
        .withMessage(PASSWORD_VALIDATION_ERROR),
    ],
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (errors.array().length) {
        throw generateResponse(400, errors.array());
      }

      const { email, password, role, fullName } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
        userId: role + "_" + nanoid(),
        createdAt: generateDate(),
        fullName,
      };

      const token = generateToken({
        email: user.email,
        userId: user.userId,
        role: user.role,
        fullName: user.fullName,
      });

      await db.collection("users").add(user);

      res.status(201).send(generateResponse(201, token));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/signin",
  [[body("email").notEmpty().isEmail(), body("password").notEmpty()]],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (errors.array().length) {
        throw generateResponse(400, errors.array());
      }

      const { email, password } = req.body;

      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("email", "==", email).get();

      if (snapshot.empty) {
        throw generateResponse(400, EMAIL_NOT_FOUND);
      }

      const user = snapshot.docs[0].data();
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw generateResponse(400, PASSWORD_NOT_MATCH);
      }

      const token = generateToken({
        email: req.body.email,
        userId: user.userId,
        role: user.role.toUpperCase(),
        fullName: user.fullName
      });

      res.status(200).send(generateResponse(200, token));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
