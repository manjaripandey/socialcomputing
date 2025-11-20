from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from simulation import run_simulation
from metrics import compute_stats

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is running!"}

@app.post("/simulate")
def simulate(params: dict):
    # Call Anushka's simulation
    timeline = run_simulation(params)

    # Call Arnav's metrics
    stats = compute_stats(timeline)

    # Return JSON to frontend
    return {
        "timeline": timeline,
        "stats": stats
    }
