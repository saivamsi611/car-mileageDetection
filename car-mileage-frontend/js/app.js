const API_URL = "http://127.0.0.1:5000";

// ------------------
// Load Accuracy
// ------------------
async function loadAccuracy() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Server not responding");

        const data = await res.json();
        document.getElementById("accuracy").innerHTML =
            `<i class="fa-solid fa-bullseye"></i> Accuracy: <b>${data.accuracy}%</b>`;
    } catch (err) {
        console.error("❌ Backend error:", err);
        const accElement = document.getElementById("accuracy");
        accElement.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Server Offline`;
        accElement.style.color = 'var(--danger)';
        accElement.style.background = 'rgba(239, 68, 68, 0.1)';
    }
}

loadAccuracy();

// ------------------
// Dark Mode Toggle
// ------------------
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    
    const iconBtn = document.getElementById("themeToggleBtn");
    iconBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Redraw charts if they exist to match theme text colors
    if(chart1 && chart2) {
        const value = chart1.data.datasets[0].data[0];
        drawCharts(value);
    }
    if (typeof batchChart1 !== 'undefined' && batchChart1 && typeof currentCsvData !== 'undefined' && currentCsvData) {
        drawBatchCharts(currentCsvData);
    }
}

// Load saved theme
window.onload = () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        document.getElementById("themeToggleBtn").innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
};

// ------------------
// File Input UI Handle
// ------------------
const csvInput = document.getElementById('csvFile');
const fileNameDisplay = document.getElementById('fileName');
const uploadArea = document.getElementById('uploadArea');

csvInput.addEventListener('change', function(e) {
    if(e.target.files.length > 0) {
        fileNameDisplay.innerHTML = `<b>${e.target.files[0].name}</b> selected`;
        uploadArea.style.borderColor = 'var(--success)';
        uploadArea.style.background = 'rgba(16, 185, 129, 0.05)';
    }
});

// ------------------
// Charts
// ------------------
let chart1, chart2;

function drawCharts(value) {
    const ctx1 = document.getElementById("chart").getContext("2d");
    const ctx2 = document.getElementById("chart2").getContext("2d");
    const isDark = document.body.classList.contains("dark");
    const textColor = isDark ? '#f1f5f9' : '#1e293b';

    Chart.defaults.color = textColor;

    if (chart1) chart1.destroy();
    if (chart2) chart2.destroy();

    document.getElementById('chartsContainer').style.display = 'grid';

    chart1 = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: ["Predicted Mileage"],
            datasets: [{
                label: "MPG",
                data: [value],
                backgroundColor: ["#4f46e5"],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    chart2 = new Chart(ctx2, {
        type: "doughnut",
        data: {
            labels: ["MPG", "Efficiency Potential"],
            datasets: [{
                data: [value, Math.max(0, 50 - value)], // Assume 50 MPG is max for visual
                backgroundColor: ["#10b981", isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// ------------------
// Input Validation
// ------------------
function validateInputs(data) {
    for (let key in data) {
        if (data[key] <= 0 || isNaN(data[key])) {
            alert(`⚠️ Please enter a valid positive number for ${key.replace('_', ' ')}`);
            return false;
        }
    }
    
    // Advanced realistic bounds (ML Guardrails)
    if (data.cylinders > 16) { alert(`⚠️ Warning: Engine with ${data.cylinders} cylinders is highly unlikely for consumer vehicles.`); return false; }
    if (data.weight < 1000 || data.weight > 10000) { alert(`⚠️ Warning: Vehicle weight of ${data.weight} lbs is outside realistic training data bounds (1000 - 10000).`); return false; }
    if (data.horsepower > 1000) { alert(`⚠️ Warning: Horsepower of ${data.horsepower} is extreme for this model's scope.`); return false; }
    
    return true;
}

// ------------------
// Loading Spinner
// ------------------
function showLoading(elementId) {
    const el = document.getElementById(elementId);
    el.style.display = 'block';
    el.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    el.style.color = 'inherit';
    el.style.background = 'transparent';
    el.style.border = 'none';
}

// ------------------
// Manual Prediction
// ------------------
document.getElementById("predictForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const resultBox = document.getElementById("result");
    const chartsContainer = document.getElementById("chartsContainer");
    
    chartsContainer.style.display = 'none';
    showLoading("result");

    const data = {
        cylinders: +document.getElementById("cylinders").value,
        displacement: +document.getElementById("displacement").value,
        horsepower: +document.getElementById("horsepower").value,
        weight: +document.getElementById("weight").value,
        acceleration: +document.getElementById("acceleration").value,
        model_year: +document.getElementById("model_year").value,
        origin: +document.getElementById("origin").value
    };

    if (!validateInputs(data)) {
        resultBox.style.display = "none";
        return;
    }

    try {
        const res = await fetch(API_URL + "/predict", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Prediction API failed");

        const result = await res.json();

        if (result.error) throw new Error(result.error);

        // Success UI
        resultBox.style.display = 'block';
        resultBox.style.background = 'rgba(16, 185, 129, 0.1)';
        resultBox.style.color = 'var(--success)';
        resultBox.style.border = '1px solid rgba(16, 185, 129, 0.2)';
        resultBox.innerHTML = `<i class="fa-solid fa-gauge-simple-high"></i> Est. Mileage: <b>${result.prediction} MPG</b>`;
        
        drawCharts(result.prediction);

    } catch (err) {
        console.error("❌ Prediction error:", err);
        resultBox.style.display = 'block';
        resultBox.style.background = 'rgba(239, 68, 68, 0.1)';
        resultBox.style.color = 'var(--danger)';
        resultBox.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        resultBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Prediction failed!`;
    }
});

// ------------------
// CSV Upload
// ------------------
async function uploadCSV() {
    const file = document.getElementById("csvFile").files[0];
    const csvResultBox = document.getElementById("csvResult");

    if (!file) {
        alert("📁 Please select a CSV file first.");
        return;
    }

    const allowMissing = document.getElementById("allowMissingCols").checked;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("allow_missing", allowMissing);

    showLoading("csvResult");

    try {
        const res = await fetch(API_URL + "/predict_csv", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "CSV API failed");
        }

        if (data.error) throw new Error(data.error);

        if (!data.data || data.data.length === 0) {
            csvResultBox.innerHTML = `<p style="text-align:center; padding: 20px;"><i class="fa-solid fa-circle-info"></i> Success, but no valid rows returned.</p>`;
            return;
        }

        displayTable(data.data);
        drawBatchCharts(data.data);

    } catch (err) {
        console.error("❌ CSV error:", err);
        csvResultBox.innerHTML = `
            <div style="padding: 15px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); color: var(--danger); text-align: center;">
                <i class="fa-solid fa-circle-xmark"></i> Upload failed: ${err.message}
            </div>`;
    }
}

let currentCsvData = null;

// ------------------
// Display Table
// ------------------
function displayTable(data) {
    currentCsvData = data;
    let html = '<div class="table-header-container"><h3>Prediction Results</h3><button onclick="downloadCSV(currentCsvData)" class="primary-btn download-btn"><i class="fa-solid fa-download"></i> Download CSV</button></div>';
    html += "<div class='table-responsive'><table><thead><tr>";

    // Headers
    Object.keys(data[0]).forEach(key => {
        // format key to Title Case
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        html += `<th>${formattedKey}</th>`;
    });
    html += "</tr></thead><tbody>";

    // Rows
    data.forEach(row => {
        html += "<tr>";
        Object.values(row).forEach(val => {
            // Emphasize the prediction column if it exists
            const displayVal = typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : val;
            html += `<td>${displayVal}</td>`;
        });
        html += "</tr>";
    });

    html += "</tbody></table></div>";

    document.getElementById("csvResult").innerHTML = html;
}

// ------------------
// Download CSV
// ------------------
function downloadCSV(data) {
    let csv = "";

    const headers = Object.keys(data[0]);
    csv += headers.join(",") + "\n";

    data.forEach(row => {
        csv += Object.values(row).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "predicted_mileage.csv";
    a.click();
}

// ------------------
// Smart Presets
// ------------------
const presets = {
    muscle: { cylinders: 8, displacement: 350, horsepower: 165, weight: 3600, acceleration: 11.5, model_year: 70, origin: 1 },
    economy: { cylinders: 4, displacement: 90, horsepower: 70, weight: 1900, acceleration: 18.0, model_year: 80, origin: 3 },
    truck: { cylinders: 8, displacement: 400, horsepower: 190, weight: 4500, acceleration: 13.0, model_year: 75, origin: 1 }
};

function applyPreset(type) {
    const p = presets[type];
    document.getElementById('cylinders').value = p.cylinders;
    document.getElementById('displacement').value = p.displacement;
    document.getElementById('horsepower').value = p.horsepower;
    document.getElementById('weight').value = p.weight;
    document.getElementById('acceleration').value = p.acceleration;
    document.getElementById('model_year').value = p.model_year;
    document.getElementById('origin').value = p.origin;
}

// ------------------
// AI Insights
// ------------------
let insightsChartObj;

async function loadInsights() {
    try {
        const wrapper = document.getElementById("insightsChartWrapper");
        
        const res = await fetch(API_URL + "/api/insights/importance");
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (json.status !== "success") throw new Error(json.message);
        
        json.data.sort((a,b) => b.importance - a.importance);
        const labels = json.data.map(d => d.feature.toUpperCase());
        const dataVals = json.data.map(d => d.importance * 100);

        wrapper.style.display = "block";
        const ctx = document.getElementById("insightsChart").getContext("2d");
        
        const isDark = document.body.classList.contains("dark");
        const textColor = isDark ? '#f1f5f9' : '#1e293b';

        if (insightsChartObj) insightsChartObj.destroy();
        insightsChartObj = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Feature Importance (%)',
                    data: dataVals,
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.6)',
                        'rgba(14, 165, 233, 0.6)',
                        'rgba(16, 185, 129, 0.6)',
                        'rgba(245, 158, 11, 0.6)',
                        'rgba(239, 68, 68, 0.6)',
                        'rgba(139, 92, 246, 0.6)',
                        'rgba(217, 70, 239, 0.6)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: textColor } },
                    title: { display: true, text: 'Importance by Factor %', color: textColor, font: { size: 14 } }
                },
                scales: {
                    r: { ticks: { display: false } }
                }
            }
        });

    } catch(err) {
        alert("Could not load insights: " + err.message);
    }
}

// ------------------
// Batch Charts
// ------------------
let batchChart1, batchChart2, batchChart3, batchChart4;

function drawBatchCharts(data) {
    const ctx1 = document.getElementById("batchChart1").getContext("2d");
    const ctx2 = document.getElementById("batchChart2").getContext("2d");
    const ctx3 = document.getElementById("batchChart3").getContext("2d");
    const ctx4 = document.getElementById("batchChart4").getContext("2d");
    const container = document.getElementById("csvChartsContainer");
    
    // Ensure display
    container.style.display = 'grid';
    
    const isDark = document.body.classList.contains("dark");
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    Chart.defaults.color = textColor;

    if (batchChart1) batchChart1.destroy();
    if (batchChart2) batchChart2.destroy();
    if (batchChart3) batchChart3.destroy();
    if (batchChart4) batchChart4.destroy();

    // 1. MPG Histogram (Distribution)
    // Create bins for MPG
    const mpgs = data.map(d => d.predicted_mileage || d.mpg || 0);
    const bins = [0, 0, 0, 0, 0];
    const binLabels = ["0-15", "16-25", "26-35", "36-45", "46+"];
    
    mpgs.forEach(mpg => {
        if(mpg <= 15) bins[0]++;
        else if(mpg <= 25) bins[1]++;
        else if(mpg <= 35) bins[2]++;
        else if(mpg <= 45) bins[3]++;
        else bins[4]++;
    });

    batchChart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Number of Vehicles',
                data: bins,
                backgroundColor: '#0ea5e9',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'MPG Distribution', color: textColor, font: { size: 14 } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                     ticks: { precision: 0 } // whole numbers only for vehicle count
                },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Scatter Plot: Weight vs MPG
    const scatterData = data.map(d => ({
        x: d.weight,
        y: d.predicted_mileage || d.mpg || 0
    }));

    batchChart2 = new Chart(ctx2, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Weight vs MPG',
                data: scatterData,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10b981',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Weight vs Predicted MPG', color: textColor, font: { size: 14 } }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Weight (lbs)', color: textColor },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                },
                y: {
                    title: { display: true, text: 'MPG', color: textColor },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                }
            }
        }
    });

    // 3. Scatter Plot: Horsepower vs MPG
    const hpData = data.map(d => ({
        x: d.horsepower,
        y: d.predicted_mileage || d.mpg || 0
    }));

    batchChart3 = new Chart(ctx3, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Horsepower vs MPG',
                data: hpData,
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: '#ef4444',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Horsepower vs Predicted MPG', color: textColor, font: { size: 14 } }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Horsepower', color: textColor },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                },
                y: {
                    title: { display: true, text: 'MPG', color: textColor },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                }
            }
        }
    });

    // 4. Feature Breakdown: Avg MPG by Cylinders (Bar Chart)
    const cylMap = {};
    data.forEach(d => {
        const c = d.cylinders || 0;
        const mpg = d.predicted_mileage || d.mpg || 0;
        if (!cylMap[c]) { cylMap[c] = { sum: 0, count: 0 }; }
        cylMap[c].sum += mpg;
        cylMap[c].count++;
    });
    const cylKeys = Object.keys(cylMap).sort((a,b) => a - b);
    const cylAvg = cylKeys.map(k => cylMap[k].sum / cylMap[k].count);

    batchChart4 = new Chart(ctx4, {
        type: 'bar',
        data: {
            labels: cylKeys.map(k => `${k} Cylinders`),
            datasets: [{
                label: 'Average MPG',
                data: cylAvg,
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Average Predicted MPG by Cylinders', color: textColor, font: { size: 14 } },
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Avg MPG', color: textColor },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } 
                },
                x: { grid: { display: false } }
            }
        }
    });
}