import express from "express";
import cors from "cors";
import taskRoutes from "@/routes/tesk.route.js";
import taskEventRoutes from "@/routes/task_even.route.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

export default app;