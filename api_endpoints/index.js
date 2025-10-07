import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./controllers/auth_router.js";

dotenv.config();
const app = express();

// // Trust proxy (important if behind load balancer or reverse proxy like Nginx)
// app.enable("trust proxy");

// // Enforce HTTPS
// app.use((req, res, next) => {
//   if (req.secure || req.headers["x-forwarded-proto"] === "https") {
//     next();
//   } else {
//     return res.status(403).json({ error: "HTTPS required" });
//   }
// });

// // CORS setup
app.use(cors());
// app.use(cors({
//   origin: [
//     "https://yourfrontenddomain.com"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

app.use(express.json());

// Routes
app.use("/auth", authRoutes);

app.listen(3000, () => console.log("✅ Server running on https://localhost:3000"));
