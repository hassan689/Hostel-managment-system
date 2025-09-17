import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../firebase/app";
import { COLLECTIONS } from "../firebase/roles";

const hostelitesCol = collection(db, COLLECTIONS.HOSTELITES);

export async function createHostelite(data) {
  // expected fields: name, joiningDate, roomNo, roomSpace, security, monthlyRent,
  // rentDatePaid, formFillCharges, institute, contact, floor, info
  const now = new Date().toISOString();
  return await addDoc(hostelitesCol, { ...data, createdAt: now, updatedAt: now });
}

export async function upsertHostelite(id, data) {
  const ref = doc(db, COLLECTIONS.HOSTELITES, id);
  const now = new Date().toISOString();
  await setDoc(ref, { ...data, updatedAt: now }, { merge: true });
  return id;
}

export async function updateHostelite(id, partial) {
  const ref = doc(db, COLLECTIONS.HOSTELITES, id);
  const now = new Date().toISOString();
  await updateDoc(ref, { ...partial, updatedAt: now });
  return id;
}

export async function deleteHostelite(id) {
  const ref = doc(db, COLLECTIONS.HOSTELITES, id);
  await deleteDoc(ref);
  return id;
}

export async function getHostelite(id) {
  const ref = doc(db, COLLECTIONS.HOSTELITES, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listHostelites({ pageSize = 20, after = null, filters = {} } = {}) {
  const constraints = [];
  if (filters.name) constraints.push(where("name", ">=", filters.name), where("name", "<=", filters.name + "\uf8ff"));
  if (filters.roomNo) constraints.push(where("roomNo", "==", filters.roomNo));
  if (filters.floor) constraints.push(where("floor", "==", filters.floor));
  if (filters.institute) constraints.push(where("institute", "==", filters.institute));
  constraints.push(orderBy("name"));
  constraints.push(limit(pageSize));
  let q = query(hostelitesCol, ...constraints);
  if (after) q = query(hostelitesCol, ...constraints, startAfter(after));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const last = snap.docs[snap.docs.length - 1] || null;
  return { items, cursor: last };
}




