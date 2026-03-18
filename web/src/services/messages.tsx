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
import type { MessageData } from "../entities/Messages";

export async function createMessage(data: MessageData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      ...data,
      status: data.scheduled ? "pending" : "sent",
      sentAt: data.scheduled && data.sentAt ? data.sentAt : serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("createMessage error:", err);
    throw err;
  }
}

export async function getAllMessages(
  uid: string,
): Promise<Array<{ id: string; data: MessageData }>> {
  const q = query(
    collection(db, "messages"),
    where("uid", "==", uid),
    fbOrderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as MessageData }));
}

export async function updateMessage(
  id: string,
  patch: Partial<MessageData>,
): Promise<void> {
  const ref = doc(db, "messages", id);
  const payload: UpdateData<MessageData> = {
    ...patch,
    status: patch.scheduled ? "pending" : "sent",
    sentAt: patch.scheduled && patch.sentAt ? patch.sentAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(ref, payload);
}

export async function deleteMessage(id: string): Promise<void> {
  const ref = doc(db, "messages", id);
  await deleteDoc(ref);
}
