import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import connectToDB from "./database/mongoose.config.js";

connectToDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`App served at: ${PORT}`);
});
