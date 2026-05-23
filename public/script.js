const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

const dashboardMenu = document.getElementById("dashboardMenu");
const historyMenu = document.getElementById("historyMenu");
const qrMenu = document.getElementById("qrMenu");
const imageMenu = document.getElementById("imageMenu");
const exportMenu = document.getElementById("exportMenu");
const clearMenu = document.getElementById("clearMenu");

const dashboardSection = document.getElementById("dashboardSection");
const historySection = document.getElementById("historySection");
const qrSection = document.getElementById("qrSection");
const imageSection = document.getElementById("imageSection");

const scanBtn = document.getElementById("scanBtn");
const urlInput = document.getElementById("urlInput");
const result = document.getElementById("result");

const threatMeter = document.getElementById("threatMeter");
const meterText = document.getElementById("meterText");

const totalScans = document.getElementById("totalScans");
const dangerCount = document.getElementById("dangerCount");
const safeCount = document.getElementById("safeCount");

const historyDiv = document.getElementById("history");
const searchInput = document.getElementById("searchInput");

const clearBtn = document.getElementById("clearBtn");

const pdfBtn = document.getElementById("pdfBtn");
const screenshotBtn = document.getElementById("screenshotBtn");

const pasteBtn = document.getElementById("pasteBtn");

const imageInput = document.getElementById("imageInput");
const imageResult = document.getElementById("imageResult");

const qrVideo = document.getElementById("qrVideo");
const qrResult = document.getElementById("qrResult");

const terminalText = document.getElementById("terminalText");

/* =========================
   MOBILE MENU
========================= */

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });

}

/* =========================
   SHOW ONLY ONE SECTION
========================= */

function hideAllSections() {

    if (dashboardSection)
        dashboardSection.classList.add("hidden");

    if (historySection)
        historySection.classList.add("hidden");

    if (qrSection)
        qrSection.classList.add("hidden");

    if (imageSection)
        imageSection.classList.add("hidden");

}

function showSection(section) {

    hideAllSections();

    if (section)
        section.classList.remove("hidden");

}

/* =========================
   MENU EVENTS
========================= */

if (dashboardMenu) {

    dashboardMenu.addEventListener("click", () => {

        showSection(dashboardSection);

    });

}

if (historyMenu) {

    historyMenu.addEventListener("click", () => {

        showSection(historySection);

        loadHistory();

    });

}

if (qrMenu) {

    qrMenu.addEventListener("click", () => {

        showSection(qrSection);

        startQRScanner();

    });

}

if (imageMenu) {

    imageMenu.addEventListener("click", () => {

        showSection(imageSection);

    });

}

if (exportMenu) {

    exportMenu.addEventListener("click", () => {

        downloadPDF();

    });

}

/* =========================
   URL SCAN
========================= */

if (scanBtn) {

    scanBtn.addEventListener("click", async() => {

        const url = urlInput.value.trim();

        if (url === "") {

            result.innerHTML = "Please enter URL";
            result.style.color = "orange";

            return;

        }

        try {

            result.innerHTML = "Scanning...";
            result.style.color = "white";

            const response = await fetch("/scan", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    url: url
                })

            });

            const data = await response.json();

            result.innerHTML = `
${data.result}
<br>
Risk Score: ${data.riskScore}
`;

            threatMeter.style.width =
                data.riskScore + "%";

            meterText.innerHTML =
                "Threat Level: " +
                data.riskScore + "%";

            if (data.riskScore >= 60) {

                threatMeter.style.background = "red";

            } else if (data.riskScore >= 20) {

                threatMeter.style.background = "yellow";

            } else {

                threatMeter.style.background = "lime";

            }

            if (data.result === "SAFE") {

                result.style.color = "lightgreen";

            } else if (data.result === "SUSPICIOUS") {

                result.style.color = "yellow";

            } else {

                result.style.color = "red";

            }

            loadHistory();

        } catch (error) {

            console.log(error);

            result.innerHTML = "Server Error";
            result.style.color = "red";

        }

    });

}

/* =========================
   LOAD HISTORY
========================= */

async function loadHistory() {

    try {

        const response = await fetch("/history");

        const data = await response.json();

        historyDiv.innerHTML = "";

        let total = 0;
        let dangerous = 0;
        let safe = 0;

        const searchValue =
            searchInput.value.toLowerCase();

        const filteredHistory =
            data.history.filter(item =>
                item.url.toLowerCase().includes(searchValue)
            );

        filteredHistory.reverse().forEach(item => {

            total++;

            if (item.result === "DANGEROUS") {
                dangerous++;
            }

            if (item.result === "SAFE") {
                safe++;
            }

            historyDiv.innerHTML += `
<div class="history-item">

<p><strong>URL:</strong> ${item.url}</p>

<p><strong>Result:</strong> ${item.result}</p>

<p><strong>Risk:</strong> ${item.riskScore}</p>

<p><strong>Time:</strong> ${item.time}</p>

</div>
`;

        });

        totalScans.innerHTML = total;
        dangerCount.innerHTML = dangerous;
        safeCount.innerHTML = safe;

    } catch (error) {

        console.log(error);

    }

}

loadHistory();

/* =========================
   SEARCH HISTORY
========================= */

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        loadHistory();

    });

}

/* =========================
   CLEAR HISTORY
========================= */

if (clearBtn) {

    clearBtn.addEventListener("click", async() => {

        try {

            await fetch("/clear-history", {
                method: "DELETE"
            });

            loadHistory();

        } catch (error) {

            console.log(error);

        }

    });

}

/* =========================
   PASTE BUTTON
========================= */

if (pasteBtn) {

    pasteBtn.addEventListener("click", async() => {

        try {

            const text =
                await navigator.clipboard.readText();

            urlInput.value = text;

        } catch (error) {

            alert("Paste Failed");

        }

    });

}

/* =========================
   IMAGE SCANNER
========================= */

if (imageInput) {

    imageInput.addEventListener("change", () => {

        imageResult.innerHTML =
            "Image Uploaded Successfully";

    });

}

/* =========================
   LIVE QR SCANNER
========================= */

async function startQRScanner() {

    if (!qrVideo) return;

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                }
            });

        qrVideo.srcObject = stream;

        qrVideo.play();

    } catch (error) {

        qrResult.innerHTML =
            "Camera Permission Denied";

    }

}

/* =========================
   SCREENSHOT
========================= */

if (screenshotBtn) {

    screenshotBtn.addEventListener("click", () => {

        html2canvas(document.body).then(canvas => {

            const link =
                document.createElement("a");

            link.download =
                "cyber-shield-report.png";

            link.href =
                canvas.toDataURL();

            link.click();

        });

    });

}

/* =========================
   PDF EXPORT
========================= */

function downloadPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const resultText =
        document.getElementById("result").innerText;

    doc.setFontSize(22);

    doc.text(
        "Cyber Shield Security Report",
        20,
        20
    );

    doc.setFontSize(16);

    doc.text(
        "Scan Result:",
        20,
        50
    );

    doc.text(
        resultText || "No Result",
        20,
        70
    );

    doc.save("Cyber_Shield_Report.pdf");

}

if (pdfBtn) {

    pdfBtn.addEventListener("click", () => {

        downloadPDF();

    });

}

/* =========================
   TERMINAL
========================= */

const hackerMessages = [

    "Initializing Cyber Shield...",

    "Scanning Network Ports...",

    "Checking Threat Database...",

    "Detecting Malware Signatures...",

    "Analyzing Suspicious URLs...",

    "Cyber Shield Protection Active..."

];

let messageIndex = 0;

function showTerminalMessages() {

    if (!terminalText) return;

    terminalText.innerHTML +=
        hackerMessages[messageIndex] + "\n";

    messageIndex++;

    if (messageIndex >= hackerMessages.length) {

        clearInterval(terminalInterval);

    }

}

const terminalInterval =
    setInterval(showTerminalMessages, 1500);