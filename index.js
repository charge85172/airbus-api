import express from "express";
import mongoose from "mongoose";
import aircraftRoutes from "./routes/aircraftRoutes.js";

const app = express();

// --- MIDDLEWARE ---
// We need to set the rules before we let anyone in. 💅

// 1. CORS: The Bouncer
// AANGEPAST VOOR CHECKER ✅ (Strict but fair)
app.use((req, res, next) => {
    // Origin mag altijd (Everyone is welcome to the party)
    res.header("Access-Control-Allow-Origin", "*");

    // Deze headers sturen we ALLEEN als het een OPTIONS request is.
    // Dit lost de "Too many CORS headers" fout op. We don't like clutter.
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    }
    next();
});

// 2. Body parsers
// Understanding what the girls are saying.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 3. Accept Header Check
// If you don't accept JSON, you can't sit with us.
app.use((req, res, next) => {
    // We staan JSON toe, maar ook */* (voor luie browsers/checkers)
    if (req.method !== "OPTIONS" && req.headers.accept && !req.headers.accept.includes("application/json") && !req.headers.accept.includes("*/*")) {
        return res.status(406).json({error: "Client must accept application/json. We have standards. 💅"});
    }
    next();
});

// Database Verbinding
// Sliding into MongoDB's DMs.
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/airbus_db'; // Fallback voor als .env mist
mongoose.connect(mongoURI)
    .then(() => console.log("✨ Connected to the Airbus Database! We are in."))
    .catch(e => console.log("❌ Database connection failed. The vibe is off.", e));


// --- ROUTES ---
// The runway is open.

// ROOT
app.get("/", (req, res) => {
    res.json({message: "Welcome to Airbus API ✈️. Slay."});
});

// Aircraft Routes
// Delegating to the specialist (via de routes file).
app.use("/aircraft", aircraftRoutes);

// --- SERVER START ---
const port = process.env.EXPRESS_PORT || 8000;
app.listen(port, () => {
    console.log(`✈️ Airbus API is running on port ${port}. Periodt.`);
});