const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Set default role on new user creation
exports.onAuthCreate = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  await userRef.set({ email: user.email, role: "staff", createdAt: new Date().toISOString() }, { merge: true });
});

// Scheduled function: send payment due reminders on the 1st of month (example log)
exports.monthlyRentReminder = functions.pubsub.schedule("0 9 1 * *").timeZone("Asia/Karachi").onRun(async () => {
  const now = new Date();
  const monthTag = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, "0")}`;
  const hostelitesSnap = await db.collection("hostelites").get();
  const paidSnap = await db.collection("payments").where("type", "==", "rent").where("forMonth", "==", monthTag).get();
  const paidIds = new Set();
  paidSnap.forEach(d => paidIds.add(d.get("hosteliteId")));
  const pending = [];
  hostelitesSnap.forEach(h => { if (!paidIds.has(h.id)) pending.push({ id: h.id, ...h.data() }); });
  // Here you could send emails or FCM notifications. For now, just log count.
  console.log(`Pending rent reminders: ${pending.length} for ${monthTag}`);
  return null;
});




