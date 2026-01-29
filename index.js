import express from "express";
import mongoose from "mongoose";
import aircraftRoutes from "./routes/aircraftRoutes.js";

const app = express();

// --- MIDDLEWARE ---

// 1. CORS: HANDMATIG
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 3. Accept Header Check
app.use((req, res, next) => {
    if (req.method !== "OPTIONS" && req.headers.accept !== "application/json") {
        return res.status(406).json({error: "Client must accept application/json"});
    }
    next();
});

// Database Verbinding
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✨ Connected to the Airbus Database!"))
    .catch(e => console.log("❌ Database connection failed.", e));

// --- ROUTES ---

// ROOT
app.get("/", (req, res) => {
    res.json({message: "Welcome to Airbus API ✈️"});
});

// Aircraft Routes
app.use("/aircraft", aircraftRoutes);

const port = process.env.EXPRESS_PORT || 8000;
app.listen(port, () => {
    console.log(`✈️ Airbus API is running on port ${port}`);
});
