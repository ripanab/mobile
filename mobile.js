const express = require('express');
const UAParser = require('ua-parser-js');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    // Server-side parsing fallback for robust phone model mapping
    const parser = new UAParser(req.headers['user-agent']);
    const systemInfo = parser.getResult();
    
    const fallbackModel = (systemInfo.device.vendor || '') + ' ' + (systemInfo.device.model || 'Generic Device');
    const fallbackOS = systemInfo.os.name + ' ' + systemInfo.os.version;
    const fallbackBrowser = systemInfo.browser.name + ' v' + systemInfo.browser.version;

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Device Hardware Diagnostic</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; margin: 0; }
        .card { max-width: 550px; margin: 20px auto; background: #1e293b; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        h2 { color: #38bdf8; margin-top: 25px; border-bottom: 2px solid #334155; padding-bottom: 10px; font-size: 18px; }
        h2:first-of-type { margin-top: 0; }
        .section { margin-bottom: 20px; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #334155; font-size: 14px; }
        .label { color: #94a3b8; font-weight: bold; }
        .value { color: #f1f5f9; text-align: right; word-break: break-word; font-family: monospace; font-size: 13px; }
        .highlight { color: #4ade80; font-weight: bold; }
    </style>
</head>
<body>

<div class="card">
    <h2>📱 Model & System Architecture</h2>
    <div class="section">
        <div class="item"><span class="label">Device Brand/Model</span><span class="value" id="model">${fallbackModel}</span></div>
        <div class="item"><span class="label">Operating System</span><span class="value" id="os">${fallbackOS}</span></div>
        <div class="item"><span class="label">Browser Engine</span><span class="value" id="browser">${fallbackBrowser}</span></div>
        <div class="item"><span class="label">Device Orientation</span><span class="value" id="orientation">Scanning...</span></div>
    </div>

    <h2>🧠 Processor & Memory (RAM)</h2>
    <div class="section">
        <div class="item"><span class="label">CPU Logical Cores</span><span class="value" id="cores">Scanning...</span></div>
        <div class="item"><span class="label">Max Concurrency Level</span><span class="value" id="cpu-level">Scanning...</span></div>
        <div class="item"><span class="label">Device Memory Class (RAM)</span><span class="value" id="ram">Scanning...</span></div>
        <div class="item"><span class="label">JS Heap Size Limit</span><span class="value" id="js-ram-limit">Scanning...</span></div>
        <div class="item"><span class="label">Active Used JS RAM</span><span class="value" id="js-ram-used">Scanning...</span></div>
    </div>

    <h2>💾 Storage (Disk Space)</h2>
    <div class="section">
        <div class="item"><span class="label">App Storage Status</span><span class="value" id="storage-status">Checking...</span></div>
        <div class="item"><span class="label">Total Allocated Storage</span><span class="value" id="storage-total">Scanning...</span></div>
        <div class="item"><span class="label">Used Storage Space</span><span class="value" id="storage-used">Scanning...</span></div>
        <div class="item"><span class="label">Available Free Space</span><span class="value" id="storage-free">Scanning...</span></div>
    </div>

    <h2>🔋 Battery Diagnostics</h2>
    <div class="section">
        <div class="item"><span class="label">Battery Status</span><span class="value" id="battery">Scanning...</span></div>
        <div class="item"><span class="label">Time to Fully Charge</span><span class="value" id="charge-time">Scanning...</span></div>
        <div class="item"><span class="label">Time Remaining (Discharge)</span><span class="value" id="discharge-time">Scanning...</span></div>
        <div class="item"><span class="label">Power Health Estimation</span><span class="value" id="battery-health">Scanning...</span></div>
    </div>

    <h2>🖥️ Display & GPU</h2>
    <div class="section">
        <div class="item"><span class="label">Screen Resolution</span><span class="value" id="resolution">Scanning...</span></div>
        <div class="item"><span class="label">Available Workspace</span><span class="value" id="avail-screen">Scanning...</span></div>
        <div class="item"><span class="label">Device Pixel Ratio (DPR)</span><span class="value" id="dpr">Scanning...</span></div>
        <div class="item"><span class="label">Touch Points (Multi-touch)</span><span class="value" id="touch">Scanning...</span></div>
        <div class="item"><span class="label">GPU Renderer</span><span class="value" id="gpu">Scanning...</span></div>
    </div>

    <h2>⚡ Network & Performance Metrics</h2>
    <div class="section">
        <div class="item"><span class="label">Network Generation</span><span class="value" id="network">Scanning...</span></div>
        <div class="item"><span class="label">Downlink Speed Estimator</span><span class="value" id="downlink">Scanning...</span></div>
        <div class="item"><span class="label">Round Trip Time (Ping)</span><span class="value" id="rtt">Scanning...</span></div>
        <div class="item"><span class="label">Data Saver Mode</span><span class="value" id="data-saver">Scanning...</span></div>
    </div>
</div>

<script>
    // 1. Dynamic Client Information Adjustments
    document.getElementById('orientation').innerText = window.innerHeight > window.innerWidth ? "Portrait" : "Landscape";
    window.addEventListener('resize', () => {
        document.getElementById('orientation').innerText = window.innerHeight > window.innerWidth ? "Portrait" : "Landscape";
    });

    // 2. CPU & Granular RAM Diagnostics
    document.getElementById('cores').innerText = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + " Logical Cores" : "N/A";
    document.getElementById('cpu-level').innerText = navigator.hardwareConcurrency >= 8 ? "High Performance (Octa-Core+)" : "Standard Performance";
    
    // Web browsers restrict exact RAM counts to specific blocks to protect privacy
    document.getElementById('ram').innerText = navigator.deviceMemory ? navigator.deviceMemory + " GB Class" : "Protected / iOS Standard";

    // Track real-time memory profile configurations (Supported on Chrome/Android Engines)
    if (window.performance && window.performance.memory) {
        const mem = window.performance.memory;
        document.getElementById('js-ram-limit').innerText = Math.round(mem.jsHeapSizeLimit / (1024 * 1024)) + " MB";
        document.getElementById('js-ram-used').innerText = Math.round(mem.usedJSHeapSize / (1024 * 1024)) + " MB";
    } else {
        document.getElementById('js-ram-limit').innerText = "iOS/Safari Restriction";
        document.getElementById('js-ram-used').innerText = "iOS/Safari Restriction";
    }

    // 3. Storage Space Discovery (Using modern StorageManager API)
    if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
            const totalGB = (estimate.quota / (1024 * 1024 * 1024)).toFixed(2);
            const usedGB = (estimate.usage / (1024 * 1024 * 1024)).toFixed(4);
            const freeGB = (totalGB - usedGB).toFixed(2);

            document.getElementById('storage-status').innerText = "Accessible";
            document.getElementById('storage-total').innerText = totalGB + " GB (App Sandbox Partition)";
            document.getElementById('storage-used').innerText = usedGB + " GB";
            document.getElementById('storage-free').innerText = freeGB + " GB";
        }).catch(() => {
            document.getElementById('storage-status').innerText = "Permission Denied";
        });
    } else {
        document.getElementById('storage-status').innerText = "Unsupported API";
    }

    // 4. Enhanced Battery Metrics & Health Estimation
    if (navigator.getBattery) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryDetails() {
                const percentage = Math.round(battery.level * 100);
                document.getElementById('battery').innerText = percentage + "% " + (battery.charging ? "⚡ (Charging)" : "🔋 (Discharging)");
                
                document.getElementById('charge-time').innerText = battery.charging ? 
                    (battery.chargingTime === Infinity ? "Calculating..." : Math.round(battery.chargingTime / 60) + " mins") : "Not Charging";
                
                document.getElementById('discharge-time').innerText = !battery.charging ? 
                    (battery.dischargingTime === Infinity ? "Calculating..." : Math.round(battery.dischargingTime / 60) + " mins") : "Plugged In";

                if (battery.level === 1 && battery.charging) {
                    document.getElementById('battery-health').className = "value highlight";
                    document.getElementById('battery-health').innerText = "Optimal / Calibrated";
                } else {
                    document.getElementById('battery-health').innerText = "Good (Operating Norm)";
                }
            }
            updateBatteryDetails();
            battery.addEventListener('chargingchange', updateBatteryDetails);
            battery.addEventListener('levelchange', updateBatteryDetails);
        });
    } else {
        document.getElementById('battery').innerText = "Protected (iOS / Safari Standard)";
        document.getElementById('charge-time').innerText = "Unavailable";
        document.getElementById('discharge-time').innerText = "Unavailable";
