const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors()); // lets the frontend talk to this server
app.use(express.json()); // lets the server read data sent as JSON

// connect to MySQL (XAMPP)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist_db",
  dateStrings: true, // keeps dates as plain text like 2026-10-04
});

// ---------- FOLDERS ----------

// get all folders
app.get("/folders", (req, res) => {
  db.query("SELECT * FROM folders", (err, rows) => {
    res.json(rows);
  });
});

// add a folder (parent_id is empty for a main folder)
app.post("/folders", (req, res) => {
  const name = req.body.name;
  const parent_id = req.body.parent_id || null;
  db.query(
    "INSERT INTO folders (name, parent_id) VALUES (?, ?)",
    [name, parent_id],
    () => {
      res.json({ ok: true });
    },
  );
});

// rename a folder  (NEW: the script needs this)
app.put("/folders/:id", (req, res) => {
  db.query(
    "UPDATE folders SET name = ? WHERE id = ?",
    [req.body.name, req.params.id],
    () => {
      res.json({ ok: true });
    },
  );
});

// delete a folder
app.delete("/folders/:id", (req, res) => {
  db.query("DELETE FROM folders WHERE id = ?", [req.params.id], () => {
    res.json({ ok: true });
  });
});

// ---------- TASKS ----------

// get all tasks
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, rows) => {
    res.json(rows);
  });
});

// add a task
app.post("/tasks", (req, res) => {
  const { folder_id, title, task_date } = req.body;
  db.query(
    "INSERT INTO tasks (folder_id, title, task_date) VALUES (?, ?, ?)",
    [folder_id, title, task_date || null],
    () => {
      res.json({ ok: true });
    },
  );
});

// switch done <-> not done  (CHANGED: now ends with /toggle)
app.put("/tasks/:id/toggle", (req, res) => {
  db.query(
    "UPDATE tasks SET is_done = NOT is_done WHERE id = ?",
    [req.params.id],
    () => {
      res.json({ ok: true });
    },
  );
});

// delete a task
app.delete("/tasks/:id", (req, res) => {
  db.query("DELETE FROM tasks WHERE id = ?", [req.params.id], () => {
    res.json({ ok: true });
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
