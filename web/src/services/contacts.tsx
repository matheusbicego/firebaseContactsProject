import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDocs,
  query,
  where,
  orderBy as fbOrderBy,
  updateDoc,
  deleteDoc,
  type UpdateData,
} from "firebase/firestore";
import { db } from "./config";
import type { ContactData } from "../entities/Contact";

export async function createContact(data: ContactData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "contacts"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("createContact error:", err);
    throw err;
  }
}

export async function getAllContacts(
  uid: string,
): Promise<Array<{ id: string; data: ContactData }>> {
  const q = query(
    collection(db, "contacts"),
    where("uid", "==", uid),
    fbOrderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as ContactData }));
}

export async function updateContact(
  id: string,
  patch: Partial<ContactData>,
): Promise<void> {
  const ref = doc(db, "contacts", id);
  const payload: UpdateData<ContactData> = {
    ...patch,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(ref, payload);
}

export async function deleteContact(id: string): Promise<void> {
  const ref = doc(db, "contacts", id);
  await deleteDoc(ref);
}
