import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export type PayloadType = {
  sk: string;
  id: string;
};

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },
    last_name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: `${process.env.DOMAIN}/images/avatar.png`,
    },
    password: {
      type: String,
      required: true,
    },
    login_history: [{}],
    tokens: [
      {
        token: { type: String, required: true },
        secretKey: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.methods.generateAuthToken = function (payload: PayloadType) {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
