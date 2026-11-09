require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes= require("./routes/incomeRoutes");
const expenseRoutes= require("./routes/expenseRoutes");
const dashboardRoutes= require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://fin-track-ivory.vercel.app",
    "http://fin-track-ivory.vercel.app",
    "https://fin-track-git-main-smritisingh21s-projects.vercel.app",
    "http://fin-track-git-main-smritisingh21s-projects.vercel.app"
]

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // 1. Check if the origin is in our "Gold Standard" list
        const isWhitelisted = allowedOrigins.indexOf(origin) !== -1;
        
        // 2. Check if it's a Vercel preview/dynamic domain
        const isVercelDomain = origin.endsWith(".vercel.app");

        if (isWhitelisted || isVercelDomain) {
            callback(null, true);
        } else {
            // "The Root Cause" - If it's not on the list or a Vercel domain, block it.
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-gemini-api-key"],
    credentials: true 
}));
app.use(express.urlencoded({extended:true}))
app.use(express.json());
connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use('/uploads' , express.static(path.join(process.cwd() ,"uploads")))




const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});