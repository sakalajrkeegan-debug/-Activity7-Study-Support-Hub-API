require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const recordsRouter = require("./routes/records");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;
// Approved frontend origins
const allowedOrigins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
};

// Middleware
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
// API Guide
app.get("/", (req, res) => {
    const baseURL = `${req.protocol}://${req.get("host")}`;

    res.status(200).type("html").send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Study Support Hub API</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 1000px;
                    margin: 30px auto;
                    padding: 20px;
                    background: #f4f6f9;
                    color: #333;
                    line-height: 1.6;
                }

                h1, h2 {
                    color: #174ea6;
                }

                section {
                    background: white;
                    padding: 20px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                }

                th {
                    background: #174ea6;
                    color: white;
                }

                pre {
                    background: #eee;
                    padding: 15px;
                    overflow-x: auto;
                    border-radius: 5px;
                }

                a {
                    color: #174ea6;
                }
            </style>
        </head>

        <body>
            <h1>Study Support Hub API</h1>

            <section>
                <h2>Project Information</h2>
                <p><strong>Student Number:</strong> 202505170</p>
                <p><strong>Description:</strong> A REST API for managing student study support requests.</p>
                <p><strong>Live Base URL:</strong> <a href="${baseURL}">${baseURL}</a></p>
            </section>

            <section>
                <h2>API Links</h2>
                <p><a href="${baseURL}/health">Health Check</a></p>
                <p><a href="${baseURL}/api/records">View All Records</a></p>
            </section>

            <section>
                <h2>Available API Routes</h2>

                <table>
                    <tr>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Description</th>
                    </tr>
                    <tr><td>GET</td><td>/</td><td>Display API guide</td></tr>
                    <tr><td>GET</td><td>/health</td><td>Check API and database health</td></tr>
                    <tr><td>GET</td><td>/api/records</td><td>Get all records</td></tr>
                    <tr><td>GET</td><td>/api/records/:id</td><td>Get one record</td></tr>
                    <tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
                    <tr><td>PUT</td><td>/api/records/:id</td><td>Update a record</td></tr>
                    <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr>
                </table>
            </section>

            <section>
                <h2>Record Fields and Validation</h2>
                <ul>
                    <li>Title: 3 to 80 characters</li>
                    <li>Category: 2 to 40 characters</li>
                    <li>Description: 5 to 300 characters</li>
                    <li>Status: Pending, In progress, or Completed</li>
                    <li>ID: Generated automatically by the database.</li>
                </ul>
            </section>

            <section>
                <h2>Example POST and PUT Request Body</h2>
                <pre>{
  "title": "Help with Java",
  "category": "Programming",
  "description": "I need help understanding Java inheritance.",
  "status": "Pending"
}</pre>
                <p>Send this JSON to /api/records using POST or to /api/records/:id using PUT.</p>
            </section>

            <section>
                <h2>Response Codes</h2>
                <ul>
                    <li>200 - Successful request</li>
                    <li>201 - Record created</li>
                    <li>400 - Invalid input</li>
                    <li>404 - Record or route not found</li>
                    <li>500 - Unexpected server error</li>
                    <li>503 - Database unavailable</li>
                </ul>
            </section>

            <section>
                <h2>Hosting Note</h2>
                <p>The hosted service may take a short time to wake up after inactivity.</p>
            </section>
        </body>
        </html>
    `);
});

// Health Check
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            database: "Connected"
        });
    } catch (error) {
        console.error("Health check failed:", error);

        res.status(503).json({
            status: "ERROR",
            database: "Unavailable"
        });
    }
});

// Records API
app.use("/api/records", recordsRouter);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON format."
        });
    }

    console.error("Server error:", err);

    res.status(500).json({
        message: "Internal server error."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});