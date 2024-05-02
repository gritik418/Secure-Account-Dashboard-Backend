import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { getUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", authenticate, getUser);

export default router;
