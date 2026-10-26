
const MAX_IN_PROGRESS = 3;

let tasks = [
  { id: 1, title: "Create wireframes", tag: "Design", priority: 1, status: "todo", important: true },
  { id: 2, title: "Choose color palette", tag: "Design", priority: 2, status: "done", important: false },
  { id: 3, title: "Build navigation", tag: "Development", priority: 1, status: "done", important: true },
  { id: 4, title: "Write HTML structure", tag: "Development", priority: 2, status: "done", important: false },
  { id: 5, title: "Style homepage", tag: "Design", priority: 2, status: "inprogress", important: false },
  { id: 6, title: "Create JavaScript logic", tag: "Development", priority: 1, status: "inprogress", important: true },
  { id: 7, title: "Test mobile layout", tag: "Testing", priority: 1, status: "todo", important: true },
  { id: 8, title: "Fix form errors", tag: "Testing", priority: 2, status: "todo", important: false },
  { id: 9, title: "Check accessibility", tag: "Testing", priority: 3, status: "todo", important: false },
  { id: 10, title: "Prepare documentation", tag: "Development", priority: 3, status: "todo", important: false }
];

let nextId = 11;

const board = document.querySelector("#board");
const notice = document.querySelector("#notice");
const searchInput = document.querySelector("#search");
const filterInput = document.querySelector("#filter");
const sortInput = document.querySelector("#sort");

const columns = {
  todo: document.querySelector("#todo"),
  inprogress: document.querySelector("#inprogress"),
  done: document.querySelector("#done")
};

function showNotice(message, error = false) {
  notice.textContent = message;
  notice.classList.toggle("error", error);
}

function countStatus(status) {
  let count = 0;

  for (const task of tasks) {
    if (task.status === status) {
      count++;
    }
  }

  return count;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.classList.add("task");

  const meta = document.createElement("div");
  meta.classList.add("task-meta");

  const tag = document.createElement("span");
  tag.classList.add("tag");
  tag.textContent = task.tag;

  const priority = document.createElement("span");
  priority.classList.add("priority");

  const priorityNames = {
    1: "High",
    2: "Medium",
    3: "Low"
  };

  priority.textContent = priorityNames[task.priority];
  priority.classList.add(
    task.priority === 1 ? "high" :
    task.priority === 2 ? "medium" : "low"
  );

  meta.append(tag, priority);

  const title = document.createElement("h3");
  title.textContent = task.title;

  const actions = document.createElement("div");
  actions.classList.add("task-actions");

  function createButton(label, action, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.id = task.id;
    button.dataset.action = action;
    button.disabled = disabled;
    return button;
  }

  if (task.status !== "todo") {
    actions.append(
      createButton("← Back", "back")
    );
  }

  if (task.status !== "done") {
    actions.append(
      createButton("Next →", "next")
    );
  }

  const deleteButton = createButton("Delete", "delete");
  deleteButton.classList.add("delete");
  actions.append(deleteButton);

  card.append(meta, title, actions);
  return card;
}

function render() {
  for (const column of Object.values(columns)) {
    column.replaceChildren();
  }

  const query = searchInput.value.trim().toLowerCase();
  const selectedTag = filterInput.value;

  let visibleTasks = tasks.filter(function (task) {
    const matchesSearch = task.title.toLowerCase().includes(query);
    const matchesTag =
      selectedTag === "All" || task.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  if (sortInput.value === "priority") {
    visibleTasks.sort((a, b) => a.priority - b.priority);
  }

  for (const task of visibleTasks) {
    columns[task.status].append(createTaskCard(task));
  }

  for (const [status, column] of Object.entries(columns)) {
    if (column.children.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No tasks found";
      column.append(empty);
    }
  }

  document.querySelector("#todoCount").textContent =
    countStatus("todo");

  document.querySelector("#progressCount").textContent =
    countStatus("inprogress");

  document.querySelector("#doneCount").textContent =
    countStatus("done");

  const done = countStatus("done");
  const percent = tasks.length === 0
    ? 0
    : Math.round((done / tasks.length) * 100);

  document.querySelector("#progressText").textContent =
    percent + "%";

  document.querySelector("#progressFill").style.width =
    percent + "%";

  document.querySelector("#progressBar")
    .setAttribute("aria-valuenow", percent);
}

function addTask() {
  const input = document.querySelector("#newTask");
  const title = input.value.trim();

  if (title.length < 3) {
    showNotice("Task title must have at least 3 characters.", true);
    return;
  }

  const newTask = {
    id: nextId++,
    title: title,
    tag: document.querySelector("#newTag").value,
    priority: Number(document.querySelector("#newPriority").value),
    status: "todo",
    important: false
  };

  tasks.push(newTask);
  input.value = "";

  showNotice("Task added successfully!");
  render();
}

board.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");

  if (!button || !board.contains(button)) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  const task = tasks.find(item => item.id === id);

  if (!task) {
    showNotice("Task not found.", true);
    return;
  }

  if (action === "delete") {
    tasks = tasks.filter(item => item.id !== id);
    showNotice("Task deleted.");
    render();
    return;
  }

  if (action === "next") {
    if (task.status === "todo") {
      if (countStatus("inprogress") >= MAX_IN_PROGRESS) {
        showNotice("In Progress can hold only 3 tasks.", true);
        return;
      }

      task.status = "inprogress";
    } else if (task.status === "inprogress") {
      task.status = "done";
    } else {
      showNotice("Task is already completed.", true);
      return;
    }
  } else if (action === "back") {
    if (task.status === "done") {
      if (countStatus("inprogress") >= MAX_IN_PROGRESS) {
        showNotice("In Progress is full.", true);
        return;
      }

      task.status = "inprogress";
    } else if (task.status === "inprogress") {
      task.status = "todo";
    } else {
      showNotice("Task is already in To Do.", true);
      return;
    }
  }

  showNotice("Task updated successfully!");
  render();
});

document.querySelector("#addTask")
  .addEventListener("click", addTask);

searchInput.addEventListener("input", render);
filterInput.addEventListener("change", render);
sortInput.addEventListener("change", render);

render();
