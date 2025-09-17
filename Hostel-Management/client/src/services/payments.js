import { collection, doc, addDoc, getDocs, getDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/app";
import { COLLECTIONS } from "../firebase/roles";

const paymentsCol = collection(db, COLLECTIONS.PAYMENTS);

// type: 'security' | 'rent' | 'form'
export async function recordPayment({ hosteliteId, type, amount, forMonth, paidOn = new Date().toISOString() }) {
  return await addDoc(paymentsCol, { hosteliteId, type, amount, forMonth, paidOn });
}

export async function listPayments({ hosteliteId, type, month }) {
  const constraints = [];
  if (hosteliteId) constraints.push(where("hosteliteId", "==", hosteliteId));
  if (type) constraints.push(where("type", "==", type));
  if (month) constraints.push(where("forMonth", "==", month));
  const q = constraints.length ? query(paymentsCol, ...constraints, orderBy("paidOn", "desc")) : query(paymentsCol, orderBy("paidOn", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Reports
export async function studentsWhoPaid(month) {
  const q = query(paymentsCol, where("type", "==", "rent"), where("forMonth", "==", month));
  const snap = await getDocs(q);
  const ids = new Set();
  snap.forEach(d => ids.add(d.data().hosteliteId));
  return Array.from(ids);
}

export async function studentsPendingForMonth(month, allHostelites) {
  const paidIds = new Set(await studentsWhoPaid(month));
  return allHostelites.filter(h => !paidIds.has(h.id));
}




