// Update slider values in real time
document.getElementById("pFake").oninput = function () {
    document.getElementById("pFakeValue").innerText = this.value;
};
document.getElementById("pReal").oninput = function () {
    document.getElementById("pRealValue").innerText = this.value;
};

document.getElementById("startBtn").onclick = runSimulation;
document.getElementById("resetBtn").onclick = resetGraph;


// ----------- BACKEND CALL (placeholder) ----------------

function runSimulation() {

    const params = {
        p_fake: parseFloat(document.getElementById("pFake").value),
        p_real: parseFloat(document.getElementById("pReal").value),
        network_size: parseInt(document.getElementById("networkSize").value),
        fact_checker: document.getElementById("factCheckerToggle").checked,
        forward_limit: document.getElementById("forwardLimitToggle").checked
    };

    console.log("Sending params:", params);

    // Once backend is ready, replace URL
    fetch("http://localhost:5000/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(data => {
        console.log("Simulation returned:", data);
        updateGraph(data.timeline);
        updateStats(data.stats);
    })
    .catch(err => console.error("Error:", err));
}


// ------------ GRAPH PLACEHOLDER ----------------

function updateGraph(timeline) {
    // For Day 1 → Just visual placeholder 
    document.getElementById("graph").innerHTML = `
        <p style="text-align:center; padding-top:20px;">
            Graph will animate here on Day 2 🤝
        </p>`;
}


// ------------ STATS UPDATE ---------------------

function updateStats(stats) {
    document.getElementById("fakePct").innerText = stats.fake_pct + "%";
    document.getElementById("realPct").innerText = stats.real_pct + "%";
    document.getElementById("steps").innerText = stats.steps;
}


// ------------ RESET FUNCTION --------------------

function resetGraph() {
    document.getElementById("graph").innerHTML = "";
    document.getElementById("fakePct").innerText = "0%";
    document.getElementById("realPct").innerText = "0%";
    document.getElementById("steps").innerText = "0";
}
