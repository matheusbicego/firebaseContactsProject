import {onSchedule} from "firebase-functions/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

export const sendScheduledMessages = onSchedule("* * * * *", async () => {
  const db = admin.firestore();

  const now = admin.firestore.Timestamp.now();

  const snapshot = await db
    .collection("messages")
    .where("status", "==", "pending")
    .where("sentAt", "<=", now)
    .get();

  if (snapshot.empty) {
    logger.info("Nenhuma mensagem para enviar");
    return;
  }

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "sent",
    });
  });

  await batch.commit();

  logger.info(`Mensagens enviadas: ${snapshot.size}`);
});
