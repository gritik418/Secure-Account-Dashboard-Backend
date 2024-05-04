import express from "express";
import { changePassword, logout, signOutFromOtherDevice, userLogin, userSignup, verifyEmail, } from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";
const router = express.Router();
router.post("/login", userLogin);
router.post("/signup", userSignup);
router.post("/verify", verifyEmail);
router.patch("/changepassword", authenticate, changePassword);
router.get("/logout", authenticate, logout);
router.get("/signout/:uniqueId", authenticate, signOutFromOtherDevice);
export default router;
//# sourceMappingURL=authRoutes.js.map