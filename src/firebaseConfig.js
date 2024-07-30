const admin = require("firebase-admin");
const { cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
module.exports = { admin, db };
