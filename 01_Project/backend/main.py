from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import inventory, pos, auth, forecasting
from database import init_db

# Initialize the local SQLite database on startup.
init_db()

app = FastAPI(
    title="NexusERP API",
    description="Backend API for AI-Based Inventory & Sales Forecasting System",
    version="0.1.0"
)

# CORS configuration to allow frontend to connect
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(pos.router)
app.include_router(forecasting.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the NexusERP Backend API"}
