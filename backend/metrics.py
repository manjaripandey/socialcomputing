from typing import Dict, Any, List
import matplotlib.pyplot as plt

LABEL_TO_STATE = {
    "unreached": 0,
    "real": 1,
    "fake": 2,
    "fact-checker": 3,
    "immune": 4,
}

def convert_time_steps_to_timeline(sim_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    raw_steps = sim_result["time_steps"]
    timeline = []

    if not raw_steps:
        return timeline

    node_ids = sorted(raw_steps[0].keys(), key=lambda x: int(x))

    for t, snapshot in enumerate(raw_steps):
        nodes_at_t = []
        for node_id in node_ids:
            label = snapshot[node_id]
            state_code = LABEL_TO_STATE.get(label, -1)
            nodes_at_t.append({
                "id": node_id,
                "state": state_code
            })

        timeline.append({
            "t": t,
            "nodes": nodes_at_t
        })

    return timeline


def build_frontend_payload(sim_result: Dict[str, Any]) -> Dict[str, Any]:

    raw_steps = sim_result["time_steps"]
    stats = sim_result.get("stats", {})
    final_dist = sim_result.get("final_distribution", {})
    edges = sim_result.get("network_edges", [])

    if raw_steps:
        node_ids = sorted(raw_steps[0].keys(), key=lambda x: int(x))
    else:
        node_ids = []

    network = {
        "nodes": [{"id": node_id} for node_id in node_ids],
        "edges": [{"source": str(u), "target": str(v)} for (u, v) in edges]
    }

    timeline = convert_time_steps_to_timeline(sim_result)

    stats_payload = {
        "fake_percent": stats.get("fake_percent", []),
        "real_percent": stats.get("real_percent", []),
        "unreached_percent": stats.get("unreached_percent", []),
        "peak_fake": stats.get("peak_fake"),
        "stable_step": stats.get("stable_step"),
        "final_distribution": final_dist,
    }

    return {
        "network": network,
        "timeline": timeline,
        "stats": stats_payload,
        "legend": {
            "0": "unreached",
            "1": "real",
            "2": "fake",
            "3": "fact-checker",
            "4": "immune"
        }
    }
