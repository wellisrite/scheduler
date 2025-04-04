import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address (from .env)
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password (from .env)
  },
});

// Function to send an email
export async function sendEmail(subject: string, text: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: process.env.NOTIFY_EMAIL, // Recipient address (your email)
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}