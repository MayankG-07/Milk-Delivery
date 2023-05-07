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
import delivery
import email_config
import key
import otp
import password
import sub
import user

import adminRoutes
import billRoutes
import get_otpRoutes
import loginRoutes
import miscRoutes
import registerRoutes
import subRoutes
