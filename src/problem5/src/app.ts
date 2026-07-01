import express from "express";
import cors from "cors";
import helloRoutes from "@/routes/hello.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", helloRoutes);

export default app;