const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist_db",
});
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");
});

// FOLDERS
app.get("/folders", (req, res) => {
  db.query("SELECT * FROM folders", (e, rows) => res.json(rows));
});

app.post("/folders", (req, res) => {
  const { name, parent_id } = req.body;
  db.query(
    "INSERT INTO folders (name, parent_id) VALUES (?, ?)",
    [name, parent_id || null],
    (e, r) => res.json({ id: r.insertId }),
  );
});

app.put("/folders/:id", (req, res) => {
  db.query(
    "UPDATE folders SET name=? WHERE id=?",
    [req.body.name, req.params.id],
    () => res.json({ ok: true }),
  );
});

app.delete("/folders/:id", (req, res) => {
  db.query("DELETE FROM folders WHERE id=?", [req.params.id], () =>
    res.json({ ok: true }),
  );
});

// TASKS
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (e, rows) => res.json(rows));
});

app.post("/tasks", (req, res) => {
  const { folder_id, title, task_date } = req.body;
  db.query(
    "INSERT INTO tasks (folder_id, title, task_date) VALUES (?, ?, ?)",
    [folder_id, title, task_date || null],
    (e, r) => res.json({ id: r.insertId }),
  );
});

app.put("/tasks/:id", (req, res) => {
  const { title, task_date } = req.body;
  db.query(
    "UPDATE tasks SET title=?, task_date=? WHERE id=?",
    [title, task_date || null, req.params.id],
    () => res.json({ ok: true }),
  );
});

// toggle done / undone
app.put("/tasks/:id/toggle", (req, res) => {
  db.query(
    "UPDATE tasks SET is_done = NOT is_done WHERE id=?",
    [req.params.id],
    () => res.json({ ok: true }),
  );
});

app.delete("/tasks/:id", (req, res) => {
  db.query("DELETE FROM tasks WHERE id=?", [req.params.id], () =>
    res.json({ ok: true }),
  );
});

app.listen(3000, () => console.log("Server on http://localhost:3000"));
