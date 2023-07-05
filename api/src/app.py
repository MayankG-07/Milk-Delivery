from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "hello world"}


import bill
import db
import email_config
import otp
import utils
import sub
import user
import house

import miscRoutes
import subRoutes
import houseRoutes
import userRoutes
