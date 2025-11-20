import random
import networkx as nx

def state_to_label(state):
    labels = {
        0: "unreached",
        1: "real",
        2: "fake",
        3: "fact-checker",
        4: "immune"
    }
    return labels.get(state, "unknown")


def create_network(n, network_type="random"):
    if n <= 0:
        raise ValueError("Network size must be positive")

    if n == 1:
        return nx.empty_graph(1)

    if network_type == "random":
        return nx.erdos_renyi_graph(n, p=0.15)

    if network_type == "small-world":
        k = min(4, n - 1)
        if k < 2:
            return nx.path_graph(n)
        if k % 2 == 1:
            k = max(2, k - 1)
        return nx.watts_strogatz_graph(n, k=k, p=0.3)

    if network_type == "scale-free":
        m = min(2, n - 1)
        if m < 1:
            return nx.path_graph(n)
        return nx.barabasi_albert_graph(n, m=m)

    raise ValueError("Invalid network type")


def initialize_states(n, fact_checkers, immune_nodes):
    states = [0] * n

    immune_count = min(max(immune_nodes, 0), n)
    immune_set = random.sample(range(n), immune_count)
    for i in immune_set:
        states[i] = 4

    possible_fc = [i for i in range(n) if states[i] == 0]
    fc_count = min(max(fact_checkers, 0), len(possible_fc))
    fc_nodes = random.sample(possible_fc, fc_count)
    for node in fc_nodes:
        states[node] = 3

    valid = [i for i in range(n) if states[i] == 0]

    if valid:
        fake_seed = random.choice(valid)
        states[fake_seed] = 2
        valid.remove(fake_seed)

    if valid:
        real_seed = random.choice(valid)
        states[real_seed] = 1

    return states


def run_simulation(params):

    n = params.get("size", 40)
    p_fake = params.get("p_fake", 0.45)
    p_real = params.get("p_real", 0.2)
    steps = params.get("steps", 20)
    fact_checkers = params.get("fact_checkers", 3)
    immune_nodes = params.get("immune_nodes", 2)
    forward_limit = params.get("forward_limit", 2)
    conversion_prob = params.get("conversion_prob", 0.2)
    network_type = params.get("network_type", "random")

    p_fake = max(0, min(1, p_fake))
    p_real = max(0, min(1, p_real))
    conversion_prob = max(0, min(1, conversion_prob))
    steps = max(1, int(steps))
    n = int(n)
    forward_limit = max(1, int(forward_limit))

    G = create_network(n, network_type)
    states = initialize_states(n, fact_checkers, immune_nodes)
    forward_count = [0] * n

    timeline = []
    stats = {
        "fake_percent": [],
        "real_percent": [],
        "unreached_percent": [],
        "stable_step": None,
        "peak_fake": 0
    }

    previous_states = None

    for step in range(steps):
        new_states = states.copy()

        for node in range(n):

            if states[node] == 4:
                continue

            if states[node] == 3:
                for neighbor in G.neighbors(node):
                    if states[neighbor] == 2 and random.random() < conversion_prob:
                        new_states[neighbor] = 1

            if states[node] in [1, 2]:

                if forward_count[node] >= forward_limit:
                    continue

                for neighbor in G.neighbors(node):

                    if forward_count[node] >= forward_limit:
                        break

                    if states[neighbor] == 4 or new_states[neighbor] != 0:
                        continue

                    if states[node] == 2 and states[neighbor] == 3:
                        continue

                    if states[neighbor] != 0:
                        continue

                    if states[node] == 2:
                        if forward_count[node] == 0 or random.random() < p_fake:
                            new_states[neighbor] = 2
                            forward_count[node] += 1

                    elif states[node] == 1:
                        if random.random() < p_real:
                            new_states[neighbor] = 1
                            forward_count[node] += 1

        states = new_states

        snapshot = {str(i): state_to_label(states[i]) for i in range(n)}
        timeline.append(snapshot)

        fake_count = states.count(2)
        real_count = states.count(1)
        unreached_count = states.count(0)

        fake_percent = (fake_count / n) * 100
        real_percent = (real_count / n) * 100
        unreached_percent = (unreached_count / n) * 100

        stats["fake_percent"].append(fake_percent)
        stats["real_percent"].append(real_percent)
        stats["unreached_percent"].append(unreached_percent)
        stats["peak_fake"] = max(stats["peak_fake"], fake_percent)

        if previous_states == states and step > 2 and stats["stable_step"] is None:
            stats["stable_step"] = step
            break

        previous_states = states.copy()

    return {
        "network_edges": list(G.edges()),
        "time_steps": timeline,
        "stats": stats,
        "final_distribution": {
            "fake": states.count(2),
            "real": states.count(1),
            "fact_checker": states.count(3),
            "immune": states.count(4),
            "unreached": states.count(0)
        }
    }
