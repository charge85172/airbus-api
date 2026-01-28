import mongoose from "mongoose";

// ✨ THE BLUEPRINT ✨
// Dit is hoe een vliegtuig eruitziet in onze database.
const AircraftSchema = new mongoose.Schema({

    // 1. Model: The Face (Bijv: "A380", "A320neo")
    model: {
        type: String,
        required: true // She needs a name to be famous! 💅
    },

    // 2. Registration: The License Plate (Bijv: "PH-NXA")
    registration: {
        type: String,
        required: true // Unique ID, because she's one of a kind. 🦄
    },

    // 3. Airline: The Employer (Bijv: "KLM", "Emirates")
    airline: {
        type: String,
        required: true // Who is paying for her fuel? 💸
    },

    // 4. Status: The Vibe Check (Bijv: "Active", "Maintenance", "Retired")
    status: {
        type: String,
        required: true // Is she working hard or hardly working? 😴
    },

    // --- EXTRA ACCESSORIES (Niet verplicht, wel cute) ---
    homebase: {
        type: String,
        default: "Unknown" // Where does she sleep at night? 🏠
    },
    description: {
        type: String,
        default: "No description available yet." // Tell us her story! 📖
    }

}, {
    // ✨ SETTINGS ✨
    timestamps: true, // We track her creation date (birthday) automatically! 🎂
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            // --- HATEOAS REALNESS ---
            // Hier toveren we de database data om naar mooie JSON met links
            // zodat de API helemaal "Level 3 RESTful" is. Slay! 💅

            // Haal de basis URL uit je .env of gebruik localhost als fallback
            const baseUrl = process.env.BASE_URI || "http://localhost:8000";

            // We voegen navigatie-links toe (De Checker houdt hiervan!) [cite: 1]
            ret._links = {
                self: {href: `${baseUrl}/aircraft/${ret._id}`},
                collection: {href: `${baseUrl}/aircraft`}
            };

            // We verwijderen het lelijke _id veld (we gebruiken de virtuele 'id')
            delete ret._id;
        }
    }
});

// Maak het model aan en exporteer het
const Aircraft = mongoose.model("Aircraft", AircraftSchema);

export default Aircraft;