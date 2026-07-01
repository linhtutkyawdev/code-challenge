import * as service from "@/services/task.service.js";
import type { Request, Response } from "express";

export function createTask(req: Request, res: Response) {
  const result = service.createTask(req.body);
  res.json(result);
}

export function listTasks(req: Request, res: Response) {
  const result = service.listTasks(req.query);
  res.json(result);
}

export function getTaskById(req: Request, res: Response) {
  const task = service.getTaskById(Number(req.params.id));

  if (!task) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(task);
}

export function updateStatus(req: Request, res: Response) {
  const task = service.updateStatus(
    Number(req.params.id),
    req.body.status
  );

  res.json(task);
}

export function archiveTask(req: Request, res: Response) {
  const result = service.archiveTask(Number(req.params.id));
  res.json(result);
}