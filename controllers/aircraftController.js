import Aircraft from "../models/Aircraft.js";

// GET: The Full Squad (Collection)
// Time to spill the tea and show the whole fleet!
export const getAircrafts = async (req, res) => {
    try {
        // 1. Pagination Settings
        const limitRequested = req.query.limit;
        const page = parseInt(req.query.page) || 1;
        const limit = limitRequested ? parseInt(req.query.limit) : 0;

        const skip = (page - 1) * limit;

        // 2. Query Building (Filter out the haters)
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.airline) query.airline = {$regex: req.query.airline, $options: "i"};

        // 3. Fetching Data
        const totalItems = await Aircraft.countDocuments(query);
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 1;

        const aircrafts = await Aircraft.find(query)
            .select('model registration airline status')
            .skip(skip)
            .limit(limit);

        // Dynamic URL Magic
        const host = req.get('host');
        const protocol = req.protocol;
        const baseUrl = `${protocol}://${host}/aircraft`;

        // ✨ THE SMART LINK BUILDER (Christa Style Edition) ✨
        const createPageLink = (targetPage) => {
            // We beginnen ALTIJD met de huidige parameters (zodat filters bewaard blijven)
            const params = new URLSearchParams(req.query);

            if (!limitRequested) {
                // Geen limit? Dan verwijderen we pagination params voor de netheid,
                // maar we behouden de filters (status, airline, etc.)! 💅
                params.delete('page');
                params.delete('limit');

                const qs = params.toString();
                return {
                    page: 1,
                    href: qs ? `${baseUrl}?${qs}` : baseUrl
                };
            }

            // Wel limit? Dan zetten we de juiste page en limit erin.
            params.set('page', targetPage);
            params.set('limit', limit);

            return {
                page: targetPage,
                href: `${baseUrl}?${params.toString()}`
            };
        };

        // Huidige URL bouwen (Self Link)
        // OOK HIER: We beginnen met de huidige query params om filters te bewaren.
        const currentParams = new URLSearchParams(req.query);

        if (limitRequested) {
            // Alleen als er om pagination gevraagd is, updaten we deze waarden expliciet
            currentParams.set('page', page);
            currentParams.set('limit', limit);
        }
        // Als er geen limit is, laten we de params zoals ze zijn (dus incl. filters, excl. geforceerde limit)

        const currentSelfUrl = currentParams.toString() ? `${baseUrl}?${currentParams.toString()}` : baseUrl;

        // Add links to items
        const aircraftsWithLinks = aircrafts.map(plane => {
            const planeJson = plane.toJSON();
            planeJson._links = {
                self: {href: `${baseUrl}/${plane.id}`},
                collection: {href: baseUrl}
            };
            return planeJson;
        });

        // 4. The Grand Reveal (Response)
        const paginationLinks = {
            first: createPageLink(1),
            last: createPageLink(totalPages),
            previous: (page > 1 && limitRequested) ? createPageLink(page - 1) : null,
            next: (page < totalPages && limitRequested) ? createPageLink(page + 1) : null
        };

        res.json({
            items: aircraftsWithLinks,
            _links: {
                self: {href: currentSelfUrl},
                collection: {href: baseUrl}
            },
            pagination: {
                currentPage: page,
                currentItems: aircrafts.length,
                totalPages: totalPages,
                totalItems: totalItems,
                _links: paginationLinks
            }
        });
    } catch (e) {
        res.status(500).json({error: "Server error: The vibe is off.", details: e.message});
    }
};

// POST: A New Star is Born
export const createAircraft = async (req, res) => {
    try {
        if (!req.body.model || !req.body.registration || !req.body.airline || !req.body.status) {
            return res.status(400).json({error: "Fill in all required fields! Don't be lazy."});
        }
        const newAircraft = await Aircraft.create(req.body);

        const baseUrl = `${req.protocol}://${req.get('host')}/aircraft`;
        const aircraftJson = newAircraft.toJSON();
        aircraftJson._links = {
            self: {href: `${baseUrl}/${newAircraft.id}`},
            collection: {href: baseUrl}
        };

        res.status(201).json(aircraftJson);
    } catch (e) {
        res.status(400).json({error: "Validation failed. Try harder."});
    }
};

// OPTIONS: The Bouncer
export const optionsCollection = (req, res) => {
    res.header("Allow", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.status(204).send();
};

// GET: Stalking a Specific Plane
// We see you looking.
export const getAircraft = async (req, res) => {
    try {
        const aircraft = await Aircraft.findById(req.params.id);
        if (!aircraft) return res.status(404).json({error: "Ghosted. Plane not found."});

        // --- CACHING LOGIC ---
        // We don't want to serve stale tea. 💅
        // Zorg dat je Schema { timestamps: true } heeft, anders bestaat updatedAt niet!
        if (aircraft.updatedAt) {
            const lastModified = new Date(aircraft.updatedAt);
            // HTTP headers negeren milliseconden, dus we ronden af voor de vergelijking
            lastModified.setMilliseconds(0);

            // 1. Zet de Last-Modified header
            res.header('Last-Modified', lastModified.toUTCString());

            // 2. Check of de client al de laatste versie heeft (If-Modified-Since)
            const ifModifiedSince = req.headers['if-modified-since'];
            if (ifModifiedSince) {
                const ifModifiedSinceDate = new Date(ifModifiedSince);

                // Als onze data niet nieuwer is dan wat de client heeft...
                if (lastModified <= ifModifiedSinceDate) {
                    // ...sturen we 304 Not Modified (geen body). Slay.
                    return res.status(304).send();
                }
            }
        }

        const baseUrl = `${req.protocol}://${req.get('host')}/aircraft`;
        const aircraftJson = aircraft.toJSON();
        aircraftJson._links = {
            self: {href: `${baseUrl}/${aircraft.id}`},
            collection: {href: baseUrl}
        };

        res.json(aircraftJson);
    } catch (e) {
        res.status(404).json({error: "Invalid ID. Do better."});
    }
};

// PUT: Glow Up Time
export const updateAircraft = async (req, res) => {
    try {
        if (!req.body.model || !req.body.registration || !req.body.airline || !req.body.status) {
            return res.status(400).json({error: "No empty fields allowed. We have standards."});
        }
        const updatedAircraft = await Aircraft.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedAircraft) return res.status(404).json({error: "Plane not found. Tragic."});

        const baseUrl = `${req.protocol}://${req.get('host')}/aircraft`;
        const aircraftJson = updatedAircraft.toJSON();
        aircraftJson._links = {
            self: {href: `${baseUrl}/${updatedAircraft.id}`},
            collection: {href: baseUrl}
        };

        res.json(aircraftJson);
    } catch (e) {
        res.status(400).json({error: "Update failed. The vibe check failed."});
    }
};


// PATCH: A Little Touch Up
// Just fixing the mascara, not the whole face.
export const patchAircraft = async (req, res) => {
    try {
        // Validation: We don't accept empty strings for the fields we are updating.
        // Als je een veld meestuurt, mag het niet leeg zijn.
        if ((req.body.model === "") || (req.body.registration === "") || (req.body.airline === "") || (req.body.status === "")) {
            return res.status(400).json({error: "Honey, you can't update something to nothing."});
        }

        // Check if there is anything to update at all
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({error: "Give me something to work with."});
        }

        const updatedAircraft = await Aircraft.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedAircraft) return res.status(404).json({error: "Ghosted. Plane not found."});

        const baseUrl = `${req.protocol}://${req.get('host')}/aircraft`;
        const aircraftJson = updatedAircraft.toJSON();
        aircraftJson._links = {
            self: {href: `${baseUrl}/${updatedAircraft.id}`},
            collection: {href: baseUrl}
        };

        res.json(aircraftJson);
    } catch (e) {
        res.status(400).json({error: "Patch failed. Messy."});
    }
};

// DELETE: Bye Felicia!
export const deleteAircraft = async (req, res) => {
    try {
        const deleted = await Aircraft.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({error: "Already gone, bestie."});
        res.status(204).send();
    } catch (e) {
        res.status(400).json({error: "Delete failed. Drama ensued."});
    }
};

// OPTIONS: Detail Check
export const optionsDetail = (req, res) => {
    res.header("Allow", "GET, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, DELETE, OPTIONS");
    res.status(204).send();
};