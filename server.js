const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Home Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// URL SCAN API
// ============================

app.post("/scan", (req, res) => {

    const { url } = req.body;

    if (!url) {
        return res.json({
            success: false,
            result: "URL is required",
            riskScore: 0,
            threatLevel: "LOW"
        });
    }

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
    let status = "SAFE";

    dangerousKeywords.forEach(keyword => {
        if (url.toLowerCase().includes(keyword)) {
            riskScore += 20;
        }
    });

    const ipPattern = /(\d{1,3}\.){3}\d{1,3}/;

    if (ipPattern.test(url)) {
        riskScore += 30;
    }

    if (riskScore >= 60) {
        status = "DANGEROUS";
        threatLevel = "HIGH";
    } else if (riskScore >= 20) {
        status = "SUSPICIOUS";
        threatLevel = "MEDIUM";
    }

    res.json({
        success: true,
        url,
        result: status,
        riskScore,
        threatLevel
    });

});

// ============================
// HISTORY
// ============================

app.get("/history", (req, res) => {

    res.json({
        success: true,
        history: []
    });

});

// ============================
// CLEAR HISTORY
// ============================

app.delete("/clear-history", (req, res) => {

    res.json({
        success: true,
        message: "History Cleared"
    });

});

// ============================
// START SERVER
// ============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(`🚀 Server running on port ${PORT}`);

});