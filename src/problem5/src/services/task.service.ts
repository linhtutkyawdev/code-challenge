import { execute, query, queryOne } from "@/db_utils.js";
import type { Task, TaskStatus } from "@/interfaces/task.interface.js";

export function createTask(input: {
  title: string;
  description?: string;
  priority?: number;
  due_at?: string;
}) {
  const result = execute(`
      INSERT INTO tasks (title, description, priority, due_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [
    input.title,
    input.description ?? null,
    input.priority ?? 3,
    input.due_at ?? null]);

  const id = Number(result.lastInsertRowid);

  execute(`
      INSERT INTO task_events (task_id, event, payload)
      VALUES (?, 'TASK_CREATED', ?)
    `, [id, JSON.stringify(input)]);

  return getTaskById(id);
}

export function getTaskById(id: number) {
  const task = queryOne<Task>(`SELECT * FROM tasks WHERE id = ?`, [id]);

  if (!task) return null;

  const urgencyScore = task.priority * 10 + (task.due_at ? Math.max(0, 10 - daysUntil(task.due_at)) : 0);

  return {
    ...task,
    urgencyScore
  };
}

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function listTasks(filter?: {
  status?: string;
}) {
  let query_string = "SELECT * FROM tasks WHERE 1=1";
  const params: any[] = [];

  if (filter?.status) {
    query_string += " AND status = ?";
    params.push(filter.status);
  }

  const tasks = query<Task>(query_string, params);

  return tasks
    .map((t) => ({
      ...t,
      urgencyScore:
        t &&
        t.priority * 10 + (t.due_at ? 5 : 0)
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
}

export function updateStatus(id: number, status: TaskStatus) {
  const current = getTaskById(id);
  if (!current) return null;

  execute(`
    UPDATE tasks
    SET status = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [status, id]);

  execute(`
    INSERT INTO task_events (task_id, event, payload)
    VALUES (?, 'STATUS_CHANGED', ?)
  `, [id, JSON.stringify({ from: current.status, to: status })]);

  return getTaskById(id);
}

export function archiveTask(id: number) {
  return updateStatus(id, "archived");
}