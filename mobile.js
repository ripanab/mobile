const express = require('express');
const { exec } = require('child_process');
const UAParser = require('ua-parser-js');
const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to run native Termux terminal commands
const runCmd = (cmd) => {
    return new Promise((resolve) => {
        exec(cmd, (error, stdout) => {
            if (error || !stdout) return resolve("Unavailable");
            resolve(stdout.trim());
        });
    });
};

app.get('/', async (req, res) => {
    const parser = new UAParser(req.headers['user-agent']);
    const info = parser.getResult();
    const fallbackModel = (info.device.vendor || '') + ' ' + (info.device.model || 'Generic Device');
    const fallbackOS = info.os.name + ' ' + info.os.version;
    const fallbackBrowser = info.browser.name + ' v' + info.browser.version;

    // Fetching absolute physical data directly from the Android kernel via Termux
    const nativeCores = await runCmd('nproc');
    const nativeRam = await runCmd('free -h | grep Mem | awk \'{print $2 " Total / " $3 " Used"}\'');
    const nativeStorage = await runCmd('df -h /storage/emulated | tail -1 | awk \'{print $2}\'');
    const nativeStorageUsed = await runCmd('df -h /storage/emulated | tail -1 | awk \'{print $3}\'');
    const nativeStorageFree = await runCmd('df -h /storage/emulated | tail -1 | awk \'{print $4}\'');
    const partitionSoftware = await runCmd('df -h /storage/emulated | tail -1 | awk \'{print $1}\'');

    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termux Hardware Diagnostic</title>
    <style>
        body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; }
        .card { max-width: 500px; margin: auto; background: #1e293b; padding: 20px; border-radius: 12px; }
        h2 { color: #22c55e; border-bottom: 2px solid #334155; padding-bottom: 5px; font-size: 16px; margin-top: 15px; }
        .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
        .label { color: #94a3b8; }
        .value { font-family: monospace; color: #e2e8f0; }
        .termux-badge { background: #22c55e; color: #0f172a; padding: 2px 6px; font-weight: bold; border-radius: 4px; font-size: 10px; }
    </style>
</head>
<body>
<div class="card">
    <h2>📱 Termux System Injection <span class="termux-badge">NATIVE DATA</span></h2>
    <div class="item"><span class="label">Model</span><span class="value">${fallbackModel}</span></div>
    <div class="item"><span class="label">OS Architecture</span><span class="value">${fallbackOS}</span></div>
    <div class="item"><span class="label">Browser Client</span><span class="value">${fallbackBrowser}</span></div>

    <h2>🧠 CPU & Hardware Memory</h2>
    <div class="item"><span class="label">True CPU Cores</span><span class="value">${nativeCores} Cores</span></div>
    <div class="item"><span class="label">Physical Hardware RAM</span><span class="value">${nativeRam}</span></div>

    <h2>💾 Physical Storage & Partitions</h2>
    <div class="item"><span class="label">Partition Software / Mount</span><span class="value">${partitionSoftware}</span></div>
    <div class="item"><span class="label">Total Internal Storage</span><span class="value">${nativeStorage}</span></div>
    <div class="item"><span class="label">Used Space</span><span class="value">${nativeStorageUsed}</span></div>
    <div class="item"><span class="label">Free Available Space</span><span class="value">${nativeStorageFree}</span></div>
    
    <h2>🔋 Device Battery</h2>
    <div class="item"><span class="label">Status</span><span class="value" id="battery">Scanning...</span></div>
</div>

<script>
    // Standard web fallbacks for properties the kernel doesn't broadcast over web connections easily
    if (navigator.getBattery) {
        navigator.getBattery().then(b => {
            document.getElementById('battery').innerText = (b.charging ? "Charging ⚡ (" : "Discharging 🔋 (") + Math.round(b.level * 100) + "%)";
        });
    }
</script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Server successfully reading phone binaries on port ${PORT}`);
});
