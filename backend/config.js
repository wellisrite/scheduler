"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    dbPath: process.env.DB_PATH || "../db/schedule.db",
    port: process.env.PORT || 3001,
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        notifyEmail: process.env.NOTIFY_EMAIL,
    },
};
