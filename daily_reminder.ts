import * as path from "path";
import * as fs from "fs";
import { Database } from "sqlite3";
import { open } from "sqlite";
const notifier = require("node-notifier");
const player = require("play-sound")({ player: "mpg123" });
const cron = require("node-cron");

const notifiedTasks = new Set(); // Keeps track of tasks we've already notified in current session

const dbFilePath = path.join(__dirname, "db/schedule.db");

async function openDatabase() {
  return open({
    filename: dbFilePath,
    driver: Database,
  });
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function notify(task: string) {
  notifier.notify({
    title: "⏰ Task Reminder",
    message: `It's time for: ${task}`,
    sound: true,
  });

  const ringtonePath = path.join(__dirname, "ringtone.mp3");
  if (fs.existsSync(ringtonePath)) {
    player.play(ringtonePath, (err) => {
      if (err) console.error("🔊 Error playing sound:", err);
    });
  } else {
    console.warn("⚠️ Ringtone file not found:", ringtonePath);
  }
}

async function checkAndTriggerTask() {
  const db = await openDatabase();
  const today = getToday();

  const now = new Date();
  const currentHour = new Date(now.getTime() - 4 * 60 * 60 * 1000).getHours(); // Adjusted time

  try {
    const task = await db.get(
      `SELECT * FROM schedule 
       WHERE date = ? 
       AND CAST(substr(hour, 1, 2) AS INTEGER) <= ? 
       AND CAST(substr(hour, 4, 2) AS INTEGER) > ?`,
      [today, currentHour, currentHour]
    );

    if (task) {
      const taskKey = `${task.date}-${task.hour}-${task.task}`;
      if (!notifiedTasks.has(taskKey)) {
        console.log(`✅ Notifying task: ${task.task}`);
        notify(task.task);
        notifiedTasks.add(taskKey);
      } else {
        console.log(`🔁 Task already notified this session: ${task.task}`);
      }
    } else {
      console.log("📭 No current task at this time.");
    }
  } catch (err) {
    console.error("❌ Error checking task:", err);
  } finally {
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