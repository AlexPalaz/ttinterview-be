const jwt = require("jsonwebtoken");
const { role } = require("./types");
const { PATIENT_NOT_FOUND, USER_NOT_FOUND } = require("./locales");
const { db } = require("./firebaseConfig");
require("dotenv").config();

const generateResponse = (status = 500, message = []) => {
  if (message === undefined) {
    message = "Invalid message format";
  }

  return {
    status: status || 500,
    message,
  };
};

function generatePort(min = 1024, max = 65535) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateDate = () => new Date().toISOString();

const generateToken = (data, expiresIn = "1h") =>
  jwt.sign(data, process.env.JWT_SECRET, { expiresIn });

const validateAuthentication = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return next(generateResponse(401, "Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return next(generateResponse(401, "Token expired"));
      }

      return next(generateResponse(403, "Unauthorized"));
    }
    req.user = user;
    next();
  });
};

const validatePatient = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return next(generateResponse(401, "Unauthorized"));

  const decodedToken = jwt.decode(token);

  if (decodedToken.role !== role.PATIENT) {
    return next(generateResponse(401, "Unauthorized"));
  }

  const usersRef = db.collection("users");
  const snapshot = await usersRef
    .where("userId", "==", decodedToken.userId)
    .get();

  if (snapshot.empty) {
    throw next(generateResponse(401, USER_NOT_FOUND));
  }

  req.user = decodedToken;
  next();
};

const validateDoctor = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return next(generateResponse(401, "Unauthorized"));

  const decodedToken = jwt.decode(token);

  if (decodedToken.role !== role.DOCTOR) {
    return next(generateResponse(401, "Unauthorized"));
  }

  const usersRef = db.collection("users");
  const snapshot = await usersRef
    .where("userId", "==", decodedToken.userId)
    .get();

  if (snapshot.empty) {
    throw next(generateResponse(401, USER_NOT_FOUND));
  }

  req.user = decodedToken;
  next();
};

function getDayName(dateString) {
  const date = new Date(dateString);
  const options = { weekday: "long" };
  return date.toLocaleDateString("en-US", options);
}

function getHour(dateString) {
  const date = new Date(dateString);
  return date.getHours();
}

function generateRandomDateByDay(weekday, hour) {
  const daysOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const currentYear = new Date().getFullYear();
  const targetDay = daysOfWeek[weekday];
  const dates = [];
  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= 31; day++) {
      let date = new Date(currentYear, month, day);
      if (
        date.getFullYear() === currentYear &&
        date.getMonth() === month &&
        date.getDay() === targetDay
      ) {
        dates.push(date);
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * dates.length);
  const randomDate = dates[randomIndex];
  randomDate.setHours(hour);

  return randomDate.toISOString();
}

module.exports = {
  generatePort,
  generateResponse,
  generateDate,
  generateToken,
  generateRandomDateByDay,
  getDayName,
  getHour,
  validatePatient,
  validateDoctor,
  validateAuthentication,
};
