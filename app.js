import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import basicRoute from "./routes/basic.route.js";
import serviceRoute from "./routes/service.routes.js";
import smsRouter from "./routes/sms.route.js";
import productRoute from "./routes/product.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import userRoute from "./routes/user.route.js";
import enquiryRouter from "./routes/enquiry.route.js";
import feedbackRouter from "./routes/feedback.route.js";
import conversationRoute from "./routes/Conversation.route.js";
import operatorRoute from "./routes/Operator.route.js";
import couponRouter from "./routes/coupon.routes.js";
import LoginUserrouter from "./routes/userLogin.routes.js";
import TicketRouter from "./routes/Ticket.route.js";
import userroute from "./routes/chatUser.route.js";
import { upload, uploadToCloudinary } from "./middleware/multer.middleware.js";
import User from "./models/Chat_Model/chat.user.model.js";
import Message from "./models/Chat_Model/chat.message.model.js";
import BasicInfo from "./models/Basicinfo.model.js";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/Test/userRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logging requests to the console

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Attach routes to app
app.use("/api/users", userRoutes);

// CORS configuration
const allowedOrigins = ["https://website3999.online", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        // Allow requests with no origin (like mobile apps or curl requests)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true, // Allow credentials if needed
  })
);

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/basicInfo", basicRoute);
app.use("/api/v1/service", serviceRoute);
app.use("/api/v1/sms", smsRouter);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/inquiry", enquiryRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/message", conversationRoute);
app.use("/api/v1/operator", operatorRoute);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/userLogin", LoginUserrouter);
app.use("/api/v1/ticket", TicketRouter);
app.use("/api/v1/chat", userroute);

// Error handling middleware
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running and ready.",
  });
});

// Catch-all route for undefined endpoints
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: "Oops! Not Found",
  });
});

// Create HTTP server and Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://website3999.online",
      "http://localhost:5173",
      "https://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("establish_connection", async ({ sender, recipient }) => {
    try {
      socket.join(sender);
      socket.join(recipient);
      console.log("Users are connected");

      socket.emit("connection_established", {
        success: true,
        message: `Connected to ${recipient}`,
      });

      console.log("users connected bruh");

      const messages = await Message.find({
        $or: [
          { sender, recipient },
          { sender: recipient, recipient: sender },
        ],
      }).sort("timestamp");

      socket.emit("message_history", messages);
    } catch (error) {
      console.error("Error in establishing connection:", error);
      socket.emit("error", "Internal Server Error");
    }
  });

  socket.on(
    "send_message",
    async ({ sender, recipient, content, media, mediaType, time }) => {
      try {
        let imageUrl = null;

        if (media) {
          const result = await uploadToCloudinary(Buffer.from(media));
          imageUrl = result.secure_url;
        }

        const message = new Message({
          sender,
          recipient,
          content,
          images: imageUrl ? { secure_url: imageUrl } : undefined,
          time,
        });

        await message.save();

        console.log(message);

        io.to(sender).emit("receive_message", message);
        io.to(recipient).emit("receive_message", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

export { app, server, io };
