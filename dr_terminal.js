"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("sqlite3");
const sqlite_1 = require("sqlite");
// Open the SQLite database
async function openDatabase() {
    return (0, sqlite_1.open)({
        filename: "/home/jtf01527/Repositories/scheduler/db/schedule.db",
        driver: sqlite3_1.Database,
    });
}
// Fetch and display the current task and the next task
async function showCurrentTask() {
    const db = await openDatabase();
    // Get the current local time
    const now = new Date();
    // const currentHour = new Date(now.getTime() - 4 * 60 * 60 * 1000).getHours(); // Subtract 4 hours in milliseconds
    const currentHour = new Date(now.getTime() - 4 * 60 * 60 * 1000).getHours(); // Subtract 4 hours in milliseconds
    const currentMinute = now.getMinutes();
    const today = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    // Query for the current task
    const currentTask = await db.get("SELECT * FROM schedule WHERE date = ? AND CAST(substr(hour, 1, 2) AS INTEGER) <= ? AND CAST(substr(hour, 4, 2) AS INTEGER) > ?", [today, currentHour, currentHour]);
    // Query for the next task
    const nextTask = await db.get("SELECT * FROM schedule WHERE date = ? AND CAST(substr(hour, 1, 2) AS INTEGER) > ? ORDER BY CAST(substr(hour, 1, 2) AS INTEGER) ASC LIMIT 1", [today, currentHour]);
    // Display the current time
    console.log(`🕒 Current time: ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`);
    // Display the current task
    if (currentTask) {
        console.log(`🔔 Current task: ${currentTask.task} (${currentTask.hour})`);
    }
    else {
        console.log("⏳ No current task at this time.");
    }
    // Display the next task
    if (nextTask) {
        console.log(`➡️ Next task: ${nextTask.task} (${nextTask.hour})`);
    }
    else {
        console.log("✅ No upcoming tasks for today.");
    }
    await db.close();
}
// Show the current task and exit
showCurrentTask();
