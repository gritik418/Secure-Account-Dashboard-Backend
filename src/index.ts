import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectToDB from "./database/mongoose.config.js";
import cors from "cors";
import path from "path";

connectToDB();

const app = express();
const PORT = process.env.PORT || 8000;
const staticPath = path.resolve("../public");

app.use(cors());
app.use(express.static(staticPath));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`App served at: ${PORT}`);
});
