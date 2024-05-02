import express from "express";
import {
  signOutFromOtherDevice,
  userLogin,
  userSignup,
} from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/login", userLogin);

router.post("/signup", userSignup);

router.get("/signout/:uniqueId", authenticate, signOutFromOtherDevice);
export default router;
