import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDocs,
  query,
  where,
  limit,
  orderBy as fbOrderBy,
  updateDoc,
  deleteDoc,
  type UpdateData,
} from "firebase/firestore";
import { db } from "./config";
import type { ConnectionData } from "../entities/Connections";

export async function createConnection(data: ConnectionData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "connection"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("createConnection error:", err);
    throw err;
  }
}

export async function getAllConnections(
  uid: string,
): Promise<Array<{ id: string; data: ConnectionData }>> {
  const q = query(
    collection(db, "connection"),
    where("uid", "==", uid),
    fbOrderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as ConnectionData }));
}

export async function updateConnection(
  id: string,
  patch: Partial<ConnectionData>,
): Promise<void> {
  const ref = doc(db, "connection", id);
  const payload: UpdateData<ConnectionData> = {
    ...patch,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(ref, payload);
}

export async function deleteConnection(id: string): Promise<void> {
  const ref = doc(db, "connection", id);
  await deleteDoc(ref);
}

export async function hasLinkedContacts(connectionId: string): Promise<boolean> {
  const q = query(collection(db, "contacts"), where("connectionId", "==", connectionId), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}
