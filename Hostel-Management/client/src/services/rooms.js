import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/app";
import { COLLECTIONS } from "../firebase/roles";

const roomsCol = collection(db, COLLECTIONS.ROOMS);

export async function upsertRoom(roomId, data) {
  const ref = doc(db, COLLECTIONS.ROOMS, roomId);
  await setDoc(ref, { ...data }, { merge: true });
  return roomId;
}

export async function getRoom(roomId) {
  const ref = doc(db, COLLECTIONS.ROOMS, roomId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listRooms({ block, floor, onlyAvailable = false } = {}) {
  const constraints = [];
  if (block) constraints.push(where("block", "==", block));
  if (floor) constraints.push(where("floor", "==", floor));
  if (onlyAvailable) constraints.push(where("occupied", "<", "capacity"));
  const q = constraints.length ? query(roomsCol, ...constraints) : roomsCol;
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function assignRoom(roomId, { hosteliteId }) {
  const ref = doc(db, COLLECTIONS.ROOMS, roomId);
  const room = await getRoom(roomId);
  if (!room) throw new Error("Room not found");
  const occupied = (room.occupied || 0) + 1;
  if (occupied > room.capacity) throw new Error("Room is full");
  await updateDoc(ref, { occupied });
  return { roomId, occupied };
}

export async function vacateRoom(roomId) {
  const ref = doc(db, COLLECTIONS.ROOMS, roomId);
  const room = await getRoom(roomId);
  if (!room) throw new Error("Room not found");
  const occupied = Math.max(0, (room.occupied || 0) - 1);
  await updateDoc(ref, { occupied });
  return { roomId, occupied };
}




