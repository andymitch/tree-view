const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Collection of SSE clients
const clients = new Set();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client", "dist")));

// Example API routes
app.get("/api/data", (req, res) => {
    res.json({ message: "Hello from the API!" });
});

app.get("/api/items", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM items");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(`Database error: ${err.message}`);
    }
});

// SSE endpoint for watching item changes
app.get("/api/items/watch", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Add this client to our active clients set
    clients.add(res);

    // Remove client when connection closes
    req.on("close", () => {
        clients.delete(res);
    });
});

app.post("/api/items", (req, res) => {
    const { name, parent } = req.body;
    if (!name) {
        return res.status(400).send("Name is required");
    }
    pool.query(
        "INSERT INTO items (name, parent) VALUES ($1, $2) RETURNING *",
        [name, parent],
        (err, result) => {
            if (err) {
                return res.status(500).send(`Database error: ${err.message}`);
            }

            const newItem = result.rows[0];
            const payload = JSON.stringify({ type: "add", data: newItem });
            clients.forEach((client) => client.write(payload));

            res.json(newItem);
        },
    );
});

app.delete("/api/items/:id", (req, res) => {
    const { id } = req.params;
    pool.query(
        "DELETE FROM items WHERE id = $1 RETURNING *",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).send(`Database error: ${err.message}`);
            }

            const { id } = result.rows[0];
            const payload = JSON.stringify({ type: "remove", id });
            clients.forEach((client) => client.write(payload));

            res.json({ id });
        },
    );
});

app.put("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const { name, parent } = req.body;
    if (!name && parent === undefined) {
        return res.status(400).send("Name or parent is required");
    }
    let query = "";
    let params = [];
    if (!name) {
        query = "UPDATE items SET parent = $1 WHERE id = $2 RETURNING *";
        params = [parent, id];
    } else if (!parent) {
        query = "UPDATE items SET name = $1 WHERE id = $2 RETURNING *";
        params = [name, id];
    } else {
        query =
            "UPDATE items SET name = $1, parent = $2 WHERE id = $3 RETURNING *";
        params = [name, parent, id];
    }

    const callback = (err, result) => {
        if (err) {
            return res.status(500).send(`Database error: ${err.message}`);
        }

        const updatedItem = result.rows[0];
        const payload = JSON.stringify({
            type: "update",
            data: updatedItem,
        });
        clients.forEach((client) => client.write(payload));

        res.json(updatedItem);
    };

    pool.query(query, params, callback);
});

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
