import { Router } from "express";
import * as controller from "@/controllers/task.controller.js";

const router = Router();

// create task
router.post("/", controller.createTask);

// list tasks
router.get("/", controller.listTasks);

// single task
router.get("/:id", controller.getTaskById);

// status change
router.patch("/:id/status", controller.updateStatus);

// archive
router.delete("/:id", controller.archiveTask);

export default router;