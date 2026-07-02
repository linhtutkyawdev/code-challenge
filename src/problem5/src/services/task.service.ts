import { calculateUrgency, execute, query, queryOne } from "@/utils.js";
import type { CreateTaskInput, ListTasksFilter, SqlValue, Task, TaskStatus, UpdateTaskInput } from "@/interfaces/task.interface.js";

export function createTask(input: CreateTaskInput) {
  const result = execute(
    `
      INSERT INTO tasks (title, description, priority, due_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `,
    [
      input.title,
      input.description ?? null,
      input.priority ?? 3,
      input.due_at ?? null,
    ]
  );

  const id = Number(result.lastInsertRowid);

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'TASK_CREATED', ?)
    `,
    [id, JSON.stringify(input)]
  );

  return getTaskById(id);
}

export function getTaskById(id: number) {
  const task = queryOne<Task>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

  if (!task) {
    return null;
  }

  return {
    ...task,
    urgencyScore: calculateUrgency(task),
  };
}

export function listTasks(filter: ListTasksFilter = {}) {
  let sql = "SELECT * FROM tasks WHERE 1 = 1";
  const params: SqlValue[] = [];

  if (filter.status !== undefined) {
    sql += " AND status = ?";
    params.push(filter.status);
  }

  if (filter.priority !== undefined) {
    sql += " AND priority = ?";
    params.push(filter.priority);
  }

  return query<Task>(sql, params)
    .map((task) => ({
      ...task,
      urgencyScore: calculateUrgency(task),
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
}

export function updateStatus(id: number, status: TaskStatus) {
  const current = getTaskById(id);

  if (!current) {
    return null;
  }

  execute(
    `
      UPDATE tasks
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
    [status, id]
  );

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'STATUS_CHANGED', ?)
    `,
    [id, JSON.stringify({ from: current.status, to: status })]
  );

  return getTaskById(id);
}

export function updateTask(id: number, input: UpdateTaskInput) {
  const current = getTaskById(id);

  if (!current) {
    return null;
  }

  const updates: string[] = [];
  const params: SqlValue[] = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    params.push(input.title);
  }

  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(input.description);
  }

  if (input.priority !== undefined) {
    updates.push("priority = ?");
    params.push(input.priority);
  }

  if (input.due_at !== undefined) {
    updates.push("due_at = ?");
    params.push(input.due_at);
  }

  if (updates.length === 0) {
    return current;
  }

  updates.push("updated_at = datetime('now')");
  params.push(id);

  execute(
    `
      UPDATE tasks
      SET ${updates.join(", ")}
      WHERE id = ?
    `,
    params
  );

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'TASK_UPDATED', ?)
    `,
    [id, JSON.stringify(input)]
  );

  return getTaskById(id);
}

export function deleteTask(id: number) {
  const current = getTaskById(id);

  if (!current) {
    return null;
  }

  execute(
    `
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'TASK_DELETED', ?)
    `,
    [id, JSON.stringify(current)]
  );

  execute("DELETE FROM tasks WHERE id = ?", [id]);

  return current;
}