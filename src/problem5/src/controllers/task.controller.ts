import type { CreateTaskInput, ListTasksFilter, UpdateTaskInput } from "@/interfaces/task.interface.js";
import * as service from "@/services/task.service.js";
import { getSingleQueryValue, getTaskId, isTaskStatus } from "@/utils.js";
import type { Request, Response } from "express";

export function createTask(req: Request, res: Response) {
  const body = req.body as unknown;
  if (
    typeof body !== "object" ||
    body === null ||
    !("title" in body) ||
    typeof body.title !== "string" ||
    body.title.trim() === ""
  ) {
    return res.status(400).json({ error: "title is required" });
  }
  const input = body as CreateTaskInput;
  const task = service.createTask(input);
  return res.status(201).json(task);
}

export function listTasks(req: Request, res: Response) {
  const statusRaw = getSingleQueryValue(req.query.status);
  const priorityRaw = getSingleQueryValue(req.query.priority);
  if (statusRaw !== undefined && !isTaskStatus(statusRaw)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  let priority: number | undefined;
  if (priorityRaw !== undefined) {
    if (!/^[1-5]$/.test(priorityRaw)) {
      return res.status(400).json({ error: "priority must be between 1 and 5" });
    }
    priority = Number(priorityRaw);
  }
  const filter: ListTasksFilter = {};
  if (statusRaw !== undefined) {
    filter.status = statusRaw;
  }
  if (priority !== undefined) {
    filter.priority = priority;
  }
  const tasks = service.listTasks(filter);
  return res.json(tasks);
}

export function getTaskById(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) {
    return res.status(400).json({ error: "Invalid task id" });
  }
  const task = service.getTaskById(id);
  if (!task) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json(task);
}

export function updateStatus(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) {
    return res.status(400).json({ error: "Invalid task id" });
  }
  const body = req.body as { status?: unknown };
  if (!isTaskStatus(body.status)) {
    return res.status(400).json({
      error: "status must be pending, in_progress, or done",
    });
  }
  const task = service.updateStatus(id, body.status);
  if (!task) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json(task);
}

export function updateTask(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) {
    return res.status(400).json({ error: "Invalid task id" });
  }
  const input = req.body as UpdateTaskInput;
  const task = service.updateTask(id, input);
  if (!task) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json(task);
}

export function deleteTask(req: Request, res: Response) {
  const id = getTaskId(req);
  if (id === null) {
    return res.status(400).json({ error: "Invalid task id" });
  }
  const task = service.deleteTask(id);
  if (!task) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.status(204).send();
}