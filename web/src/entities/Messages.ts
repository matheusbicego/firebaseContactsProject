export interface MessageData {
    uid: string;
    title: string;
    contactsId: string[];
    text: string;
    scheduled: boolean;
    status?: "pending" | "sent";
    sentAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}