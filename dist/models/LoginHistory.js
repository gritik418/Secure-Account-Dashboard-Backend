import mongoose from "mongoose";
const LoginHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    device: {
        type: mongoose.Schema.Types.Mixed,
    },
    secretKey: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const LoginHistory = mongoose.models.LoginHistory ||
    mongoose.model("LoginHistory", LoginHistorySchema);
export default LoginHistory;
//# sourceMappingURL=LoginHistory.js.map