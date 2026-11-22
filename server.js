require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const recordsRouter = require("./routes/records");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Guide
app.get("/", (req, res) => {
    const baseURL = `${req.protocol}://${req.get("host")}`;

    res.status(200).json({
        project: "Study Support Hub API",
        studentNumber: "202505170",
        description: "A REST API for managing student study support requests.",
        baseURL,
        endpoints: {
            health: `${baseURL}/health`,
            records: `${baseURL}/api/records`
        },
        routes: [
            { method: "GET", path: "/api/records", description: "Get all records" },
            { method: "GET", path: "/api/records/:id", description: "Get one record" },
            { method: "POST", path: "/api/records", description: "Create a record" },
            { method: "PUT", path: "/api/records/:id", description: "Update a record" },
            { method: "DELETE", path: "/api/records/:id", description: "Delete a record" }
        ],
        fields: {
            title: "3 to 80 characters",
            category: "2 to 40 characters",
            description: "5 to 300 characters",
            status: ["Pending", "In progress", "Completed"]
        },
        requestBody: {
            title: "Help with Java",
            category: "Programming",
            description: "I need help understanding Java inheritance.",
            status: "Pending"
        },
        responseCodes: {
            200: "Successful request",
            201: "Record created",
            400: "Invalid input",
            404: "Record or route not found",
            500: "Unexpected server error",
            503: "Database unavailable"
        },
        note: "The hosted service may take a short time to wake up after inactivity."
    });
});

// Health check
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({
            status: "OK",
            database: "Connected"
        });
    } catch (error) {
        console.error("Health check failed:", error.message);
        res.status(503).json({
            message: "Database unavailable."
        });
    }
});

// Records routes
app.use("/api/records", recordsRouter);

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Error handler
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            message: "Invalid JSON format."
        });
    }

    console.error("Server error:", error.message);
    res.status(500).json({
        message: "An unexpected server error occurred."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Study Support Hub API running on port ${PORT}`);
});
