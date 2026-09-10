import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './modules/auth/auth.routes.js';
import { signalingHandler } from './sockets/signaling.socket.js';
import { errorHandler } from './middlewares/error.middleware.js';
import passport from './config/passport.js';
import adminRoutes from "./modules/admin/admin.routes.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize())


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

signalingHandler(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();