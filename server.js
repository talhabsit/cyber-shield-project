const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// Railway PORT Fix
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Home Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// MYSQL CONNECTION
// ============================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// Connect Database
db.connect((err) => {

    if (err) {

        console.log("❌ MYSQL CONNECTION ERROR:");
        console.log(err);

    } else {

        console.log("✅ MySQL Connected");

    }

});

// ============================
// URL SCAN API
// ============================

app.post("/scan", (req, res) => {

    const { url } = req.body;

    // Check if URL exists
    if (!url) {

        return res.json({
            success: false,
            result: "URL is required"
        });

    }

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

    // Detect IP Address URLs
    const ipPattern = /(\d{1,3}\.){3}\d{1,3}/;

    if (ipPattern.test(url)) {
        riskScore += 30;
    }

    // Final Result
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

    // Save Into MySQL
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

            console.log("❌ MYSQL INSERT ERROR:");
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

// ============================
// GET SCAN HISTORY
// ============================

app.get("/history", (req, res) => {

    const sql = "SELECT * FROM scans ORDER BY id DESC";

    db.query(sql, (error, results) => {

        if (error) {

            console.log("❌ HISTORY ERROR:");
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

// ============================
// CLEAR HISTORY
// ============================

app.delete("/clear-history", (req, res) => {

    const sql = "DELETE FROM scans";

    db.query(sql, (error, result) => {

        if (error) {

            console.log("❌ CLEAR HISTORY ERROR:");
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

// ============================
// START SERVER
// ============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(`🚀 Server running on port ${PORT}`);

});