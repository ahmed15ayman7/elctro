import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupSwagger } from "./docs/swagger.js";
import authRouter from "./routes/auth.router.js";
import productsRouter from "./routes/products.router.js";
import categoriesRouter from "./routes/categories.router.js";
import ordersRouter from "./routes/orders.router.js";
import usersRouter from "./routes/users.router.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [process.env.FRONTEND_ORIGIN ?? "http://localhost:3000", "https://api.ahmed15ayman7.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body + Cookie parsers ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API documentation (OpenAPI + Swagger UI) ─────────────────────────────────
setupSwagger(app);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;
