import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const EmailVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    secretKey: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "10m",
    },
  },
  { timestamps: true }
);

EmailVerificationSchema.pre("save", async function (next) {
  if (this.isModified("secretKey")) {
    const salt = await bcrypt.genSalt(8);
    const hashedKey = await bcrypt.hash(this.secretKey, salt);
    this.secretKey = hashedKey;
    next();
  }
});

const EmailVerification =
  mongoose.models.EmailVerification ||
  mongoose.model("EmailVerification", EmailVerificationSchema);

export default EmailVerification;
