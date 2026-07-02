import { Router } from "express";
import * as controller from "@/controllers/task_event.controller.js";

const router = Router();

// GET /events
router.get("/", controller.listTaskEvents);

// GET /events/:id
router.get("/:id", controller.getTaskEventById);

// GET /tasks/:taskId/events
router.get("/task/:taskId", controller.getTaskEventsByTaskId);

export default router;