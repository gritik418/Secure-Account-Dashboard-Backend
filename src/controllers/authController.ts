import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import vine, { errors } from "@vinejs/vine";
import loginSchema from "../validators/loginSchema.js";
import User, { PayloadType } from "../models/User.js";
import LoginHistory from "../models/LoginHistory.js";
import { ErrorReporter } from "../validators/ErrorReporter.js";
import signupSchema from "../validators/signupSchema.js";
import EmailVerification from "../models/EmailVerification.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail, { MailOptionsType } from "../utils/sendEmail.js";
import verificationTemplate from "../utils/verificationTemplate.js";
import DeviceDetector from "device-detector-js";
import { v4 as uuidv4 } from "uuid";
import verificationSchema from "../validators/verificationSchema.js";
import changePasswordSchema from "../validators/changePasswordSchema.js";

vine.errorReporter = () => new ErrorReporter();

export const userLogin = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.email || data.email === "") {
      if (!data.password || data.password === "") {
        return res.status(400).json({
          success: false,
          status: 400,
          errors: {
            email: "Email field is required.",
            password: "Password field is required.",
          },
        });
      }

      return res.status(400).json({
        success: false,
        status: 400,
        errors: { email: "Email field is required." },
      });
    }

    const output = await vine.validate({
      schema: loginSchema,
      data,
    });

    const user = await User.findOne({
      $or: [{ email: output.email }, { username: output.email }],
    });

    if (!user || !user.email_verified) {
      return res.status(401).json({
        success: false,
        status: 400,
        message: "Invalid Credentials!!",
      });
    }

    const verify = await bcrypt.compare(output.password, user.password);

    if (!verify) {
      return res.status(401).json({
        success: false,
        status: 400,
        message: "Invalid Credentials!!",
      });
    }

    const otp = generateOTP();

    const verificationToken = new EmailVerification({
      userId: user._id,
      secretKey: otp,
    });

    await verificationToken.save();

    const mailOptions: MailOptionsType = {
      from: "SecureAccountDashboard@official.com",
      to: output.email,
      subject: "Verify your Email Address",
      text: `Verify your Email Address to create an account with iNotes.\nThe otp for the email address is ${otp}.\nThe otp is valid only for 10 minutes.`,
      html: verificationTemplate(otp),
    };

    await sendEmail(mailOptions);

    return res.status(200).json({
      success: true,
      status: 200,
      email: output.email,
      message: "Email sent.",
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return res.status(400).json({
        success: false,
        status: 400,
        errors: error.messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error",
      status: 400,
    });
  }
};

export const userSignup = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const output = await vine.validate({
      schema: signupSchema,
      data,
    });

    const checkUsername = await User.findOne({ username: output.username });

    if (checkUsername && checkUsername.email_verified) {
      return res.status(401).json({
        success: false,
        status: 400,
        message: "Username already taken!!",
      });
    }

    const checkExisting = await User.findOne({ email: output.email });

    if (checkExisting) {
      if (checkExisting.email_verified) {
        return res.status(401).json({
          success: false,
          status: 400,
          message: "Account already exists!!",
        });
      }

      await User.findByIdAndDelete(checkExisting._id);
      await EmailVerification.findOneAndDelete({
        userId: checkExisting._id,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(output.password, salt);

    const user = new User({
      first_name: output.first_name,
      last_name: data.last_name || "",
      username: output.username,
      email: output.email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    const otp = generateOTP();

    const verificationToken = new EmailVerification({
      userId: savedUser._id,
      secretKey: otp,
    });

    await verificationToken.save();

    const mailOptions: MailOptionsType = {
      from: "SecureAccountDashboard@official.com",
      to: output.email,
      subject: "Verify your Email Address",
      text: `Verify your Email Address to create an account with iNotes.\nThe otp for the email address is ${otp}.\nThe otp is valid only for 10 minutes.`,
      html: verificationTemplate(otp),
    };

    await sendEmail(mailOptions);

    return res.status(200).json({
      success: true,
      status: 200,
      email: output.email,
      message: "Email sent.",
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return res.status(400).json({
        success: false,
        status: 400,
        errors: error.messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error",
      status: 400,
    });
  }
};

export const signOutFromOtherDevice = async (req: Request, res: Response) => {
  try {
    const historyId = req.params.uniqueId;
    const userId = req.params.id;

    if (!historyId) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Id is required.",
      });
    }

    const history = await LoginHistory.findByIdAndDelete(historyId);

    await User.findByIdAndUpdate(userId, {
      $pull: {
        login_history: history._id,
        tokens: { secretKey: history.secretKey },
      },
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Signed Out.",
      deletedHistory: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      status: 400,
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const output = await vine.validate({
      schema: verificationSchema,
      data,
    });

    const user = await User.findOne({ email: output.email });
    if (!user) {
      await EmailVerification.findOneAndDelete({ userId: user._id });
      await User.findByIdAndDelete(user._id);

      return res.status(401).json({
        success: false,
        status: 400,
        message: "Invalid Email.",
      });
    }

    const verificationToken = await EmailVerification.findOne({
      userId: user._id,
    });
    if (!verificationToken) {
      return res.status(401).json({
        success: false,
        status: 400,
        message: "OTP Expired.",
      });
    }

    const verify = await bcrypt.compare(
      output.otp,
      verificationToken.secretKey
    );
    if (!verify) {
      await EmailVerification.findOneAndDelete({ userId: user._id });
      await User.findByIdAndDelete(user._id);
      return res.status(401).json({
        success: false,
        status: 400,
        message: "OTP Expired.",
      });
    }

    const userAgent = req.headers["user-agent"];

    const checkUserAgent = await LoginHistory.findOne({
      userId: user._id,
      userAgent,
    });

    const sk = uuidv4();

    if (checkUserAgent) {
      const verifySecretKey = await User.findOne({
        tokens: { $eq: { secretKey: checkUserAgent.secretKey } },
      });

      if (!verifySecretKey) {
        const deletedHistory = await LoginHistory.findOneAndDelete(
          checkUserAgent._id
        );
        await User.findByIdAndUpdate(user._id, {
          $pull: { login_history: deletedHistory._id },
        });
      } else {
        const payload: PayloadType = {
          id: user._id,
          sk: checkUserAgent.secretKey,
        };

        const token = await user.generateAuthToken(payload);

        await User.findByIdAndUpdate(user._id, {
          $push: { tokens: { token, secretKey: sk } },
        });

        const deviceDetector = new DeviceDetector();

        const device = deviceDetector.parse(userAgent);

        const history = new LoginHistory({
          userId: user._id,
          secretKey: sk,
          userAgent,
          device: device,
        });

        await history.save();

        await User.findByIdAndUpdate(user._id, {
          $push: { login_history: history._id },
          $set: { email_verified: true },
        });

        await EmailVerification.findOneAndDelete({ userId: user._id });

        return res.status(201).json({
          success: true,
          status: 201,
          token: token,
          message: "Account created Successfully..",
        });
      }
    }

    const payload: PayloadType = {
      id: user._id,
      sk: sk,
    };
    const token = await user.generateAuthToken(payload);

    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token, secretKey: sk } },
    });

    const deviceDetector = new DeviceDetector();

    const device = deviceDetector.parse(userAgent);

    const history = new LoginHistory({
      userId: user._id,
      secretKey: sk,
      userAgent,
      device: device,
    });

    await history.save();

    await User.findByIdAndUpdate(user._id, {
      $push: { login_history: history._id },
      $set: { email_verified: true },
    });

    await EmailVerification.findOneAndDelete({ userId: user._id });

    return res.status(201).json({
      success: true,
      status: 201,
      token: token,
      message: "Account created Successfully..",
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return res.status(400).json({
        success: false,
        status: 400,
        errors: error.messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error",
      status: 400,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const userId = req.params.id;

    const output = await vine.validate({
      schema: changePasswordSchema,
      data,
    });

    const user = await User.findById(userId);

    if (output.new_password === output.old_password) {
      return res.status(401).json({
        success: false,
        message: "Password must be different from old one.",
        status: 401,
      });
    }

    const verify = await bcrypt.compare(output.old_password, user.password);

    if (!verify) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password.",
        status: 401,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(output.new_password, salt);

    await User.findByIdAndUpdate(userId, {
      $set: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password Changed.",
      status: 200,
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return res.status(400).json({
        success: false,
        status: 400,
        errors: error.messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error",
      status: 400,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const secretKey = req.params.sk;
    const token = req.params.token;
    const userId = req.params.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { tokens: { secretKey, token } },
    });

    return res.status(200).json({
      success: true,
      message: "Logged out.",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      status: 400,
    });
  }
};
