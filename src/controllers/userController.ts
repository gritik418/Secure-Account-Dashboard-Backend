import { Request, Response } from "express";
import User from "../models/User.js";
import LoginHistory from "../models/LoginHistory.js";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select({ password: 0, tokens: 0 })
      .populate("login_history");

    const loginRecord = await LoginHistory.findOne({
      secretKey: req.params.sk,
    });

    if (!user || !user.email_verified) {
      return res.status(401).json({
        success: false,
        status: 400,
        message: "Please Login.",
      });
    }

    await LoginHistory.findByIdAndUpdate(loginRecord._id, {
      $set: { active: true },
    });

    return res.status(200).json({
      success: true,
      status: 200,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 400,
      message: "Server Error.",
    });
  }
};
