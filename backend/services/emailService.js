"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables from .env
// Configure the email transporter
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
    auth: {
        user: process.env.EMAIL_USER, // Your email address (from .env)
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password (from .env)
    },
});
// Function to send an email
async function sendEmail(subject, text) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: process.env.NOTIFY_EMAIL, // Recipient address (your email)
            subject: subject,
            text: text,
        };
        await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully!");
    }
    catch (error) {
        console.error("❌ Error sending email:", error);
    }
}
