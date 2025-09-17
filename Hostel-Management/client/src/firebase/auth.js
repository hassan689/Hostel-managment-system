import { auth } from "./app";
import { db } from "./app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

export async function signUp(email, password, profile = {}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, "users", cred.user.uid);
  await setDoc(userRef, { email, role: profile.role || "staff", ...profile }, { merge: true });
  return cred.user;
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role || "staff" : "staff";
}

export async function logout() {
  await signOut(auth);
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}




