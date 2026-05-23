const express = require("express");
const path = require("path");

const db = require("./config/mysql");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// URL Scan API
app.post("/scan", (req, res) => {

    const { url } = req.body;

    let status = "";

    // URL validation
    const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;

    if (!urlPattern.test(url)) {

        return res.json({
            success: false,
            result: "INVALID URL"
        });

    }

    // Dangerous keywords
    const dangerousKeywords = [
        "free",
        "login",
        "bonus",
        "win",
        "prize",
        "gift",
        "crypto",
        "bank",
        "verify",
        "password"
    ];

    let riskScore = 0;
    let threatLevel = "LOW";
    // Check dangerous keywords
    dangerousKeywords.forEach(keyword => {

        if (url.toLowerCase().includes(keyword)) {
            riskScore += 20;
        }

    });

    // Detect IP address URLs
    const ipPattern = /(\d{1,3}\.){3}\d{1,3}/;

    if (ipPattern.test(url)) {
        riskScore += 30;
    }

    // Final result
    if (riskScore >= 60) {

        status = "DANGEROUS";
        threatLevel = "HIGH";

    } else if (riskScore >= 20) {

        status = "SUSPICIOUS";
        threatLevel = "MEDIUM";

    } else {

        status = "SAFE";
        threatLevel = "LOW";

    }

    // Save into MySQL
    const sql = `
        INSERT INTO scans (url, result, riskScore, time)
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        url,
        status,
        riskScore,
        new Date().toLocaleString()
    ];

    db.query(sql, values, (error, resultData) => {
        if (error) {

            console.log("MYSQL ERROR:");
            console.log(error);

            return res.json({
                success: false,
                result: "Database Error"
            });

        }
        res.json({
            success: true,
            url: url,
            result: status,
            riskScore: riskScore,
            threatLevel: threatLevel
        });

    });

});

// Get scan history
app.get("/history", (req, res) => {

    const sql = "SELECT * FROM scans ORDER BY id DESC";

    db.query(sql, (error, results) => {

        if (error) {
            console.log(error);

            return res.json({
                success: false
            });
        }

        res.json({
            success: true,
            history: results
        });

    });

});

// Clear history
app.delete("/clear-history", (req, res) => {

    const sql = "DELETE FROM scans";

    db.query(sql, (error, result) => {

        if (error) {
            console.log(error);

            return res.json({
                success: false
            });
        }

        res.json({
            success: true,
            message: "History Cleared"
        });

    });

});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});