// -----------------------------------------------------
// Update slider values in real time
// -----------------------------------------------------
document.getElementById("pFake").oninput = function () {
    document.getElementById("pFakeValue").innerText = this.value;
};

document.getElementById("pReal").oninput = function () {
    document.getElementById("pRealValue").innerText = this.value;
};

document.getElementById("startBtn").onclick = runSimulation;
document.getElementById("resetBtn").onclick = resetGraph;


// -----------------------------------------------------
// BACKEND CALL
// -----------------------------------------------------

function runSimulation() {

    const params = {
        p_fake: parseFloat(document.getElementById("pFake").value),
        p_real: parseFloat(document.getElementById("pReal").value),
        size: parseInt(document.getElementById("networkSize").value),   // IMPORTANT: backend expects "size"
        fact_checkers: document.getElementById("factCheckerToggle").checked ? 3 : 0,
        forward_limit: document.getElementById("forwardLimitToggle").checked ? 2 : 10,
        steps: 20,
        immune_nodes: 2,
        conversion_prob: 0.2,
        network_type: "random"
    };

    console.log("Sending params:", params);

    fetch("http://127.0.0.1:8000/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(data => {
        console.log("Simulation returned:", data);

        // Update graph (placeholder)
        updateGraph(data.timeline);

        // Convert backend stats → simple final stats
        updateStats({
            fake_pct: data.stats.fake_percent.at(-1),
            real_pct: data.stats.real_percent.at(-1),
            steps: data.timeline.length
        });
    })
    .catch(err => console.error("Error:", err));
}


// -----------------------------------------------------
// GRAPH (placeholder)
// -----------------------------------------------------
function updateGraph(timeline) {
    document.getElementById("graph").innerHTML = `
        <p style="text-align:center; padding-top:20px;">
            Graph will animate here on Day 2 🤝
        </p>`;
}


// -----------------------------------------------------
// UPDATE STATS PANEL
// -----------------------------------------------------
function updateStats(stats) {
    document.getElementById("fakePct").innerText = stats.fake_pct.toFixed(1) + "%";
    document.getElementById("realPct").innerText = stats.real_pct.toFixed(1) + "%";
    document.getElementById("steps").innerText = stats.steps;
}


// -----------------------------------------------------
// RESET FUNCTION
// -----------------------------------------------------
function resetGraph() {
    document.getElementById("graph").innerHTML = "";
    document.getElementById("fakePct").innerText = "0%";
    document.getElementById("realPct").innerText = "0%";
    document.getElementById("steps").innerText = "0";
}
