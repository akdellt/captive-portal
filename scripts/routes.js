import express from "express";
import { matriculas } from "./controller.js";

const router = express.Router();

router.get("/", matriculas);

export default router;