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
        size: parseInt(document.getElementById("networkSize").value),
        p_fake: parseFloat(document.getElementById("pFake").value),
        p_real: parseFloat(document.getElementById("pReal").value),
        fact_checkers: document.getElementById("factCheckerToggle").checked ? 3 : 0,
        immune_nodes: 2,
        forward_limit: document.getElementById("forwardLimitToggle").checked ? 2 : 99,
        steps: 20,
        network_type: "random"
    };

    fetch("http://localhost:8000/simulate", {   // FastAPI default port
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(data => {
        console.log("Simulation data:", data);
        drawNetwork(data.network);
        animateTimeline(data.timeline);
        updateStats(data.stats);
    })
    .catch(err => console.error(err));
}

let network = null;
let nodesDataset = null;

function drawNetwork(networkData) {

    console.log("Drawing network...", networkData);

    if (!networkData || !networkData.nodes || !networkData.edges) {
        console.error("Network data missing!", networkData);
        return;
    }

    const nodes = networkData.nodes.map(n => ({
        id: parseInt(n.id),
        label: n.id.toString(),
        color: "#ccc"
    }));

    const edges = networkData.edges.map(e => ({
        from: parseInt(e.source),
        to: parseInt(e.target)
    }));

    console.log("Nodes:", nodes);
    console.log("Edges:", edges);

    nodesDataset = new vis.DataSet(nodes);
    const edgesDataset = new vis.DataSet(edges);

    const container = document.getElementById("graph");

    console.log("Container:", container);
    console.log("Container size:", container.clientWidth, container.clientHeight);

    const data = {
        nodes: nodesDataset,
        edges: edgesDataset
    };

    const options = {
        nodes: { shape: "dot", size: 12 },
        edges: { color: "#999" },
        physics: {
            stabilization: true,
            barnesHut: { gravitationalConstant: -8000 }
        }
    };

    network = new vis.Network(container, data, options);
}


function animateTimeline(timeline) {
    let t = 0;

    const interval = setInterval(() => {
        if (t >= timeline.length) {
            clearInterval(interval);
            return;
        }

        const snapshot = timeline[t].nodes;

        snapshot.forEach(n => {
            let color = "#cccccc"; // unreached

            if (n.state === 1) color = "#4caf50";   // real = green
            if (n.state === 2) color = "#f44336";   // fake = red
            if (n.state === 3) color = "#2196f3";   // fact-checker = blue
            if (n.state === 4) color = "#9c27b0";   // immune = purple

            nodesDataset.update({ id: parseInt(n.id), color: color });
        });

        t++;
    }, 600); // 0.6 seconds per timestep
}


// -----------------------------------------------------
// UPDATE STATS PANEL
// -----------------------------------------------------
function updateStats(stats) {
    const len = stats.fake_percent.length;

    document.getElementById("fakePct").innerText =
        stats.fake_percent[len - 1].toFixed(2) + "%";

    document.getElementById("realPct").innerText =
        stats.real_percent[len - 1].toFixed(2) + "%";

    document.getElementById("steps").innerText =
        len;
}

function resetGraph() {
    document.getElementById("graph").innerHTML = "";
    if (nodesDataset) nodesDataset.clear();
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
