import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectToDB from "./database/mongoose.config.js";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import LoginHistory from "./models/LoginHistory.js";

connectToDB();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://secure-account-dashboard.vercel.app"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8000;
const staticPath = path.resolve("../public");

app.use(cors());
app.use(express.static(staticPath));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);

io.on("connection", (socket) => {
  socket.on("active", async ({ currentDevice, login_history }) => {
    socket.join(currentDevice._id);
    await LoginHistory.findByIdAndUpdate(currentDevice._id, {
      $set: { active: true },
    });
    login_history.map((history: { _id: string }) => {
      if (history._id !== currentDevice._id) {
        socket
          .to(history._id)
          .emit("device-active", { activeDevice: currentDevice._id });
      }
    });
  });

  socket.on("offline", async ({ currentDevice, login_history }) => {
    await LoginHistory.findByIdAndUpdate(currentDevice._id, {
      $set: { active: false },
    });
    login_history.map((history: { _id: string }) => {
      if (history._id !== currentDevice._id) {
        socket
          .to(history._id)
          .emit("device-inactive", { inactiveDevice: currentDevice._id });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`App served at: ${PORT}`);
});
