import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectToDB from "./database/mongoose.config.js";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
connectToDB();
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "https://secure-account-dashboard.vercel.app",
            "http://localhost:3000",
        ],
        credentials: true,
    },
});
const PORT = process.env.PORT || 8000;
const staticPath = path.resolve("../public");
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://secure-account-dashboard.vercel.app");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors());
app.use(express.static(staticPath));
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
io.on("connection", (socket) => {
    socket.on("active", ({ currentDevice, login_history }) => {
        socket.join(currentDevice._id);
        login_history.map((history) => {
            if (history._id !== currentDevice._id) {
                socket.to(history._id).emit("device-active", { login_history });
            }
        });
    });
});
server.listen(PORT, () => {
    console.log(`App served at: ${PORT}`);
});
//# sourceMappingURL=index.js.map