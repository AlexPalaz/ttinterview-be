const locales = {
  SUCCESS: "Success",
  PASSWORD_NOT_MATCH: "Password does not match",
  EMAIL_NOT_FOUND: "E-mail not found",
  EMAIL_ALREADY_IN_USE: "E-mail already in use",
  USER_NOT_FOUND: "User not found",
  PATIENT_NOT_FOUND: "Patient not found",
  DOCTOR_NOT_FOUND: "Doctor not found",
  DOCTOR_NOT_AVAILABLE: "Doctor not available",
  APPOINTMENTS_NOT_FOUND: "No appointments found",
  APPOINTMENT_ALREADY_TAKEN: "Appointment already taken. Doctor not available on the selected date, try with another one",
  DOCTOR_NOT_VALID: "User is not a doctor",
  PATIENT_NOT_VALID: "User is not a patient",
  INVALID_DATE: "Invalid date",
  ROLE_VALIDATION_ERROR: "Role must be either PATIENT or DOCTOR",
  PASSWORD_VALIDATION_ERROR:
    "Password should be more stronger (use at least one uppercase character, one special symbol and one number)",
};

module.exports = {
  ...locales,
};
