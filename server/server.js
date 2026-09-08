import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './config/db.js';

dotenv.config();
const app = express();
app.use(express.json()); 

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();