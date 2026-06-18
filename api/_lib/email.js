import { adminDb } from "./admin.js";

const MAIL_COLLECTION = process.env.MAIL_COLLECTION || "mail";
const EMAIL_FROM = process.env.EMAIL_FROM;

export async function sendEmail({ to, subject, html }) {
  const doc = { to: [to], message: { subject, html } };
  if (EMAIL_FROM) doc.from = EMAIL_FROM;

  const ref = await adminDb.collection(MAIL_COLLECTION).add(doc);
  return ref.id;
}
