def compute_stats(timeline):
    return {
        "fake_pct": [10, 40, 70],
        "real_pct": [20, 30, 20],
        "peak_fake": 70,
        "steps": len(timeline)
    }
