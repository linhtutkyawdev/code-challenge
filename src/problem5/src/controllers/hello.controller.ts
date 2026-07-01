import type { Request, Response } from "express";
import * as service from "@/services/hello.service.js";

export const sayHello = async (req: Request, res: Response) => {
    const data = service.getHelloData()
    res.json(data);
};
