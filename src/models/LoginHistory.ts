import mongoose from "mongoose";

const LoginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    device: {
      client: {
        type: String,
        name: String,
        version: String,
        engine: String,
        engineVersion: String,
      },
      os: {
        name: String,
        version: String,
        platform: String,
      },
      device: {
        type: String,
        brand: String,
        model: String,
      },
    },
    secretKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const LoginHistory =
  mongoose.models.LoginHistory ||
  mongoose.model("LoginHistory", LoginHistorySchema);

export default LoginHistory;
