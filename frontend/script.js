const API = "http://localhost:3000";
let folders = [];
let tasks = [];
let openForm = null; // openForm → remembers which inline form is currently open

// Helpers  This function converts dangerous HTML characters into safe text.
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
// Loading data from the backend
async function load() {
  folders = await (await fetch(API + "/folders")).json();
  tasks = await (await fetch(API + "/tasks")).json();
  render();
}
// The reusable send() function
async function send(url, method, body) {
  await fetch(API + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  openForm = null;
  load();
}

//  Open / close inline forms
function showForm(kind, id) {
  openForm = { kind, id };
  render();
  const input = document.getElementById("inline-input");
  if (input) {
    input.focus();
    input.select();
  }
}
function closeForm() {
  openForm = null;
  render();
}

// Enter and Escape keyboard support
function onEnter(e, action) {
  if (e.key === "Enter") action();
  if (e.key === "Escape") closeForm();
}

//  Folders
function addFolder() {
  const input = document.getElementById("folderName");
  const name = input.value.trim();
  if (!name) return;
  send("/folders", "POST", { name });
  input.value = "";
}

// Adding a subfolder
function saveSubFolder(parentId) {
  const name = document.getElementById("inline-input").value.trim();
  if (name) send("/folders", "POST", { name, parent_id: parentId });
}
function saveRename(id) {
  const name = document.getElementById("inline-input").value.trim();
  if (name) send("/folders/" + id, "PUT", { name });
}
function deleteFolder(id) {
  if (confirm("Delete this folder and everything inside?"))
    send("/folders/" + id, "DELETE");
}

// adding Tasks
function saveTask(folderId) {
  const title = document.getElementById("inline-input").value.trim();
  const task_date = document.getElementById("inline-date").value;
  if (title) send("/tasks", "POST", { folder_id: folderId, title, task_date });
}

// it switches a task between Active and Done,
function toggleTask(id) {
  send("/tasks/" + id + "/toggle", "PUT");
}
function deleteTask(id) {
  send("/tasks/" + id, "DELETE");
}

//  Render This function builds the actual HTML shown on the page.
function renderFolder(folder) {
  const subs = folders.filter((f) => f.parent_id === folder.id);
  const myTasks = tasks.filter((t) => t.folder_id === folder.id);
  const done = myTasks.filter((t) => t.is_done).length;
  const isOpen = openForm && openForm.id === folder.id;

  // This is where your rename functionality becomes interesting.
  const nameHtml =
    isOpen && openForm.kind === "rename"
      ? `<input id="inline-input" class="inline" value="${esc(folder.name)}"
         onkeydown="onEnter(event, () => saveRename(${folder.id}))" />
       <button onclick="saveRename(${folder.id})">Save</button>
       <button onclick="closeForm()">Cancel</button>`
      : `<b>📁 ${esc(folder.name)}</b>`;

  // inline form shown under the header
  let formHtml = "";
  if (isOpen && openForm.kind === "sub") {
    formHtml = `
      <div class="inline-form">
        <input id="inline-input" class="inline" placeholder="Type subfolder name..."
          onkeydown="onEnter(event, () => saveSubFolder(${folder.id}))" />
        <button onclick="saveSubFolder(${folder.id})">Add</button>
        <button onclick="closeForm()">Cancel</button>
      </div>`;
  }
  if (isOpen && openForm.kind === "task") {
    formHtml = `
      <div class="inline-form">
        <input id="inline-input" class="inline" placeholder="What to do...."
          onkeydown="onEnter(event, () => saveTask(${folder.id}))" />
        <input id="inline-date" type="date" class="inline date" />
        <button onclick="saveTask(${folder.id})">Add</button>
        <button onclick="closeForm()">Cancel</button>
      </div>`;
  }

  // Rendering tasks
  return `
    <div class="folder">
      <div class="folder-head">
        ${nameHtml}
        <span>${done}/${myTasks.length} done</span>
        <button onclick="showForm('rename', ${folder.id})">✏️</button>
        ${
          folder.parent_id === null
            ? `<button onclick="showForm('sub', ${folder.id})">+ SubFolder</button>`
            : ""
        }
        <button onclick="showForm('task', ${folder.id})">+ Task</button>
        <button onclick="deleteFolder(${folder.id})">🗑</button>
      </div>
      ${formHtml}
      ${myTasks
        .map(
          (t) => `
        <div class="task ${t.is_done ? "done" : ""}">
          <span>${esc(t.title)} ${t.task_date ? "📅 " + t.task_date.slice(0, 10) : ""}</span>
          <span class="status">${t.is_done ? "Done" : "Active"}</span>
          <button onclick="toggleTask(${t.id})">${t.is_done ? "↩ Undo" : "✔ Done"}</button>
          <button onclick="deleteTask(${t.id})">🗑</button>
        </div>`,
        )
        .join("")}
      <div class="subs">${subs.map(renderFolder).join("")}</div>
    </div>`;
}

// put the generated html into id app html file
function render() {
  const roots = folders.filter((f) => f.parent_id === null);
  document.getElementById("app").innerHTML = roots.map(renderFolder).join("");
  const input = document.getElementById("inline-input");
  if (input) input.focus();
}

// press Enter in the top "New folder" box
document.getElementById("folderName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addFolder();
});

load(); // This starts the application.
