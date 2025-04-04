"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const sqlite3_1 = require("sqlite3");
const sqlite_1 = require("sqlite");
const notifier = require("node-notifier");
const player = require("play-sound")({ player: "mpg123" });
const cron = require("node-cron");
const notifiedTasks = new Set(); // Keeps track of tasks we've already notified in current session
const dbFilePath = path.join(__dirname, "db/schedule.db");
async function openDatabase() {
    return (0, sqlite_1.open)({
        filename: dbFilePath,
        driver: sqlite3_1.Database,
    });
}
function getToday() {
    return new Date().toISOString().split("T")[0];
}
function notify(task) {
    notifier.notify({
        title: "⏰ Task Reminder",
        message: `It's time for: ${task}`,
        sound: true,
    });
    const ringtonePath = path.join(__dirname, "ringtone.mp3");
    if (fs.existsSync(ringtonePath)) {
        player.play(ringtonePath, (err) => {
            if (err)
                console.error("🔊 Error playing sound:", err);
        });
    }
    else {
        console.warn("⚠️ Ringtone file not found:", ringtonePath);
    }
}
async function checkAndTriggerTask() {
    const db = await openDatabase();
    const today = getToday();
    const now = new Date();
    const currentHour = new Date(now.getTime() - 4 * 60 * 60 * 1000).getHours(); // Adjusted time
    try {
        const task = await db.get(`SELECT * FROM schedule 
       WHERE date = ? 
       AND CAST(substr(hour, 1, 2) AS INTEGER) <= ? 
       AND CAST(substr(hour, 4, 2) AS INTEGER) > ?`, [today, currentHour, currentHour]);
        if (task) {
            const taskKey = `${task.date}-${task.hour}-${task.task}`;
            if (!notifiedTasks.has(taskKey)) {
                console.log(`✅ Notifying task: ${task.task}`);
                notify(task.task);
                notifiedTasks.add(taskKey);
            }
            else {
                console.log(`🔁 Task already notified this session: ${task.task}`);
            }
        }
        else {
            console.log("📭 No current task at this time.");
        }
    }
    catch (err) {
        console.error("❌ Error checking task:", err);
    }
    finally {
        await db.close();
    }
}
// Schedule every 5 minutes
cron.schedule("*/5 * * * *", async () => {
    console.log("🔁 Cron check running...");
    await checkAndTriggerTask();
});
(async () => {
    console.log("🚀 Scheduler initialized...");
    await checkAndTriggerTask();
})();
