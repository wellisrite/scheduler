import dotenv from "dotenv";

dotenv.config();

export const config = {
  dbPath: process.env.DB_PATH || "../db/schedule.db",
  port: process.env.PORT || 3001,
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    notifyEmail: process.env.NOTIFY_EMAIL,
  },
};