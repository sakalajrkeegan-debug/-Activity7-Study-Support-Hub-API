const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all records
router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM records ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {
        next(error);
    }
});

// GET one record by ID
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid positive record ID is required."
            });
        }

        const result = await pool.query(
            "SELECT * FROM records WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
});

// POST create a new record
router.post("/", async (req, res, next) => {
    try {
        const { title, category, description, status } = req.body;

        if (
            !title || typeof title !== "string" ||
            !category || typeof category !== "string" ||
            !description || typeof description !== "string" ||
            !status || typeof status !== "string"
        ) {
            return res.status(400).json({
                message: "All four fields are required."
            });
        }

        const cleanTitle = title.trim();
        const cleanCategory = category.trim();
        const cleanDescription = description.trim();

        if (
            cleanTitle.length < 3 || cleanTitle.length > 80 ||
            cleanCategory.length < 2 || cleanCategory.length > 40 ||
            cleanDescription.length < 5 || cleanDescription.length > 300 ||
            !["Pending", "In progress", "Completed"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid record data. Check field lengths and status."
            });
        }

        const result = await pool.query(
            `INSERT INTO records (title, category, description, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [cleanTitle, cleanCategory, cleanDescription, status]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
});

// PUT update an existing record
router.put("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid positive record ID is required."
            });
        }

        const { title, category, description, status } = req.body;

        if (
            !title || typeof title !== "string" ||
            !category || typeof category !== "string" ||
            !description || typeof description !== "string" ||
            !status || typeof status !== "string"
        ) {
            return res.status(400).json({
                message: "All four fields are required."
            });
        }

        const cleanTitle = title.trim();
        const cleanCategory = category.trim();
        const cleanDescription = description.trim();

        if (
            cleanTitle.length < 3 || cleanTitle.length > 80 ||
            cleanCategory.length < 2 || cleanCategory.length > 40 ||
            cleanDescription.length < 5 || cleanDescription.length > 300 ||
            !["Pending", "In progress", "Completed"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid record data. Check field lengths and status."
            });
        }

        const result = await pool.query(
            `UPDATE records
             SET title = $1, category = $2, description = $3, status = $4
             WHERE id = $5
             RETURNING *`,
            [cleanTitle, cleanCategory, cleanDescription, status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
});

// DELETE a record
router.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid positive record ID is required."
            });
        }

        const result = await pool.query(
            "DELETE FROM records WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });

    } catch (error) {
        next(error);
    }
});
module.exports = router;