import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/app";
import { COLLECTIONS } from "../firebase/roles";

export async function findStudentsUnpaidForMonth(month) {
  const hostelitesSnap = await getDocs(collection(db, COLLECTIONS.HOSTELITES));
  const allHostelites = hostelitesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const paymentsQ = query(collection(db, COLLECTIONS.PAYMENTS), where("type", "==", "rent"), where("forMonth", "==", month));
  const paymentsSnap = await getDocs(paymentsQ);
  const paidIds = new Set(paymentsSnap.docs.map(d => d.data().hosteliteId));
  return allHostelites.filter(h => !paidIds.has(h.id));
}

export async function showAvailableRooms() {
  const q = query(collection(db, COLLECTIONS.ROOMS));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => (r.capacity || 0) - (r.occupied || 0) > 0);
}




