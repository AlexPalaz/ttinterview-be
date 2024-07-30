const role = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
};

const specializations = [
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "General Practitioner",
  "Orthopedic Surgeon",
  "Radiologist",
  "Psychiatrist",
  "Endocrinologist",
  "Ophthalmologist",
];

const qualifications = [
  "MD (Doctor of Medicine)",
  "DO (Doctor of Osteopathic Medicine)",
  "MBBS (Bachelor of Medicine, Bachelor of Surgery)",
  "FACS (Fellow of the American College of Surgeons)",
  "FACP (Fellow of the American College of Physicians)",
  "FRCP (Fellow of the Royal College of Physicians)",
  "Board Certified in Internal Medicine",
  "Board Certified in Pediatrics",
  "Board Certified in Psychiatry",
  "Board Certified in Surgery",
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const status = {
  UPCOMING: "UPCOMING",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
};

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

module.exports = {
  specializations,
  qualifications,
  daysOfWeek,
  hours,
  role,
  status,
};
