import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
// import ResponseHandler from "./utils/ResponseHandler.js";
// import { commonResponses } from "./utils/responseMessages.js";
// import status from "http-status";
import { connectDB } from "./utils/connection.js";
import { allowedDomains } from "./utils/config/config.js";
import cookieParser from "cookie-parser";
import { AppError } from "./utils/errors/errors.js";
import { errorHandler } from "./middlewares/errorHandler.js";
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set

// Custom morgan format to log the API path
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(
  cors({
    origin: allowedDomains, // Use the allowed domains from config
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 200, // For legacy browser support
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

app.use(cookieParser());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
// app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});

app.use(limiter);

connectDB();

app.use("/api", routes);

app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.path}`, 404, "NOT_FOUND"));
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
