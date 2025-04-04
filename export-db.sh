#!/bin/bash

# filepath: /home/jtf01527/Repositories/scheduler/import_csv.sh

# Variables
DB_FILE="db/schedule.db"
CSV_FILE="db/schedule.csv"
TABLE_NAME="schedule"

# Check if the database file exists
if [ ! -f "$DB_FILE" ]; then
  echo "❌ Database file '$DB_FILE' not found!"
  exit 1
fi

# Check if the CSV file exists
if [ ! -f "$CSV_FILE" ]; then
  echo "❌ CSV file '$CSV_FILE' not found!"
  exit 1
fi

# Preprocess the CSV file to remove the header row
TEMP_CSV="temp_schedule.csv"
tail -n +2 "$CSV_FILE" > "$TEMP_CSV" # Remove the header row

# Import the CSV into SQLite, specifying the columns to insert into
sqlite3 "$DB_FILE" <<EOF
-- Create a temporary table with the correct column names
DROP TABLE IF EXISTS temp_import;
CREATE TABLE temp_import (
    date TEXT,
    hour TEXT,
    task TEXT
);

-- Import the CSV data into the temporary table
.mode csv
.import $TEMP_CSV temp_import

-- Debug: Check the contents of the temporary table
SELECT * FROM temp_import;

-- Insert data into the schedule table, explicitly mapping columns
INSERT INTO $TABLE_NAME (date, hour, task)
SELECT date, hour, task FROM temp_import;

-- Debug: Check the contents of the schedule table
SELECT * FROM $TABLE_NAME;

-- Drop the temporary table
DROP TABLE temp_import;
EOF

# Clean up the temporary file
rm "$TEMP_CSV"

echo "✅ CSV data imported successfully into '$TABLE_NAME' table in '$DB_FILE'."