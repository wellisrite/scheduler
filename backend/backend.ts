import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { config } from "./config";
import { logger } from "./logger";

const dbFilePath = config.dbPath;
const PORT = config.port;

const app = express();
console.log(dbFilePath)
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Function to open the SQLite database
async function openDatabase() {
  return open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });
}

// API Routes
app.get("/api/schedule", async (req, res) => {
  const { date, sort, page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
  const db = await openDatabase();

  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const filterDate = date || today; // Default to today's date if no date is provided
    const offset = (Number(page) - 1) * Number(limit); // Calculate the offset for pagination

    let query = "SELECT * FROM schedule WHERE date = ?";
    const params: any[] = [filterDate];

    if (sort === "asc") {
      query += " ORDER BY date ASC, hour ASC";
    } else if (sort === "desc") {
      query += " ORDER BY date DESC, hour DESC";
    }

    query += " LIMIT ? OFFSET ?"; // Add pagination to the query
    params.push(Number(limit), offset);

    const rows = await db.all(query, params);

    // Get the total count of schedules for the given date
    const totalQuery = "SELECT COUNT(*) as total FROM schedule WHERE date = ?";
    const totalResult = await db.get(totalQuery, [filterDate]);
    const total = totalResult.total;

    res.json({
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    logger.error("error", err);
    res.status(500).json({ error: err.message });
  } finally {
    await db.close();
  }
});

app.get("/api/schedule/status", async (req, res) => {
  const db = await openDatabase();
  try {
    const today = new Date().toISOString().split("T")[0];
    const filterDate = String(req.query.date || today);

    const rows = await db.all(
      "SELECT * FROM schedule WHERE date = ? ORDER BY hour ASC",
      [filterDate]
    );

    const now = new Date();
    const hourOffset = 4; // adjust based on your desired timezone
    const localNow = new Date(now.getTime() - hourOffset * 60 * 60 * 1000);
    const currentHour = localNow.getHours();
    const currentMinute = localNow.getMinutes();
    const currentFloat = currentHour + currentMinute / 60;

    let currentMessage = "No current task";
    let nextMessage = "No upcoming tasks";

    for (let i = 0; i < rows.length; i++) {
      const { hour, task } = rows[i];
      const [start, end] = hour.split("-").map(Number);

      if (currentFloat >= start && currentFloat < end) {
        currentMessage = `🔔 ${task}`;
      } else if (start > currentFloat) {
        const diffMinutes = Math.round((start - currentFloat) * 60);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        const timeString = [
          hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "",
          minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "",
        ]
          .filter(Boolean)
          .join(" ");

        nextMessage = `➡️ ${task} in ${timeString}`;
        break; // we only need the next one
      }
    }

    res.json({ currentMessage, nextMessage });
  } catch (err) {
    logger.error("status endpoint error", err);
    res.status(500).json({ error: err.message });
  } finally {
    await db.close();
  }
});



app.post("/api/schedule", async (req, res) => {
  const { date, hour, task } = req.body;
  const db = await openDatabase();
  try {
    const result = await db.run(
      "INSERT INTO schedule (date, hour, task) VALUES (?, ?, ?)",
      [date, hour, task]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    logger.error("error", err);
    res.status(500).json({ error: err.message });
  } finally {
    await db.close();
  }
});

app.put("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { date, hour, task } = req.body;
  const db = await openDatabase();
  try {
    const result = await db.run(
      "UPDATE schedule SET date = ?, hour = ?, task = ? WHERE id = ?",
      [date, hour, task, id]
    );
    res.json({ updated: result.changes });
  } catch (err) {
    logger.error("error", err);
    res.status(500).json({ error: err.message });
  } finally {
    await db.close();
  }
});

app.delete("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const db = await openDatabase();
  try {
    const result = await db.run("DELETE FROM schedule WHERE id = ?", id);
    res.json({ deleted: result.changes });
  } catch (err) {
    logger.error("error", err);
    res.status(500).json({ error: err.message });
  } finally {
    await db.close();
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});