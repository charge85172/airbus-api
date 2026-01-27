console.log("bitch ik werk gwn")
import express from "express";
import mongoose from "mongoose";
// import cors from "cors"; <--- WEG ERMEE! 🚫
import Aircraft from "./models/Aircraft.js";

const app = express();

// --- MIDDLEWARE ---

// 1. CORS: HANDMATIG (Want we zijn pro's en volgen de regels) 💅
app.use((req, res, next) => {
    // Wie mag erbij? Iedereen! (*)
    res.header("Access-Control-Allow-Origin", "*");
    // Welke headers mogen meegestuurd worden? (Authorization is vast voor later handig!)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    // Welke acties zijn toegestaan?
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 3. Accept Header Check
app.use((req, res, next) => {
    if (req.method !== "OPTIONS" && req.headers.accept !== "application/json") {
        return res.status(406).json({error: "Ew, we only accept application/json here, bestie. 💅"});
    }
    next();
});

// Database Verbinding
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✨ Connected to the Airbus Database! Periodt bestiee"))
    .catch(e => console.log("❌ Database connection failed.", e));

// --- ROUTES ---

// ROOT
app.get("/", (req, res) => {
    res.json({message: "Welcome to Airbus API ✈️. We built this runway ourselves!"});
});

// OPTIONS: Pre-flight checks (Verplicht voor rubric!)
app.options("/aircraft", (req, res) => {
    // Hier mag je ook nog specifiek aangeven wat MAG op deze route
    res.header("Allow", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.status(204).send();
});

app.options("/aircraft/:id", (req, res) => {
    res.header("Allow", "GET,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
    res.status(204).send();
});

// GET: Alle vliegtuigen
app.get("/aircraft", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.airline) query.airline = {$regex: req.query.airline, $options: "i"};

        const totalItems = await Aircraft.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const aircrafts = await Aircraft.find(query)
            .skip(skip)
            .limit(limit);

        res.json({
            items: aircrafts,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                limit: limit,
                _links: {
                    self: {href: `http://localhost:8000/aircraft?page=${page}&limit=${limit}`}
                }
            }
        });
    } catch (e) {
        res.status(500).json({error: "Server meltdown! 🔥", details: e.message});
    }
});

// POST: Nieuw vliegtuig
app.post("/aircraft", async (req, res) => {
    try {
        if (!req.body.model || !req.body.registration || !req.body.airline || !req.body.status) {
            return res.status(400).json({error: "Fill in all required fields, queen! 😤"});
        }
        const newAircraft = await Aircraft.create(req.body);
        res.status(201).json(newAircraft);
    } catch (e) {
        res.status(400).json({error: "Validation fail. Awkward..."});
    }
});

// GET Detail
app.get("/aircraft/:id", async (req, res) => {
    try {
        const aircraft = await Aircraft.findById(req.params.id);
        if (!aircraft) return res.status(404).json({error: "Plane not found. Ghosted. 👻"});
        res.json(aircraft);
    } catch (e) {
        res.status(404).json({error: "Invalid ID."});
    }
});

// PUT: Update
app.put("/aircraft/:id", async (req, res) => {
    try {
        if (!req.body.model || !req.body.registration || !req.body.airline || !req.body.status) {
            return res.status(400).json({error: "No empty fields allowed!"});
        }
        const updatedAircraft = await Aircraft.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedAircraft) return res.status(404).json({error: "Plane not found"});
        res.json(updatedAircraft);
    } catch (e) {
        res.status(400).json({error: "Update failed."});
    }
});

// DELETE
app.delete("/aircraft/:id", async (req, res) => {
    try {
        const deleted = await Aircraft.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({error: "Already gone."});
        res.status(204).send();
    } catch (e) {
        res.status(400).json({error: "Delete failed."});
    }
});

const port = process.env.EXPRESS_PORT || 8000;
app.listen(port, () => {
    console.log(`✈️ Airbus API is taking off from port ${port}. clear the runways girls`);
});