export type TaskStatus = "pending" | "in_progress" | "done" | "archived";

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: number;
  status: TaskStatus;
  due_at?: string;
  created_at: string;
  updated_at: string;
}