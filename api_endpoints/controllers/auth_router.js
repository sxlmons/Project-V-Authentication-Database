import express from "express";
import { signup, login, authMe, refreshToken } from "./authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMe);
router.post("/refreshToken", refreshToken);

export default router;
