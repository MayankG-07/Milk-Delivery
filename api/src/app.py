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


import src.bill
import src.db
import src.delivery
import src.email_config
import src.key
import src.otp
import src.password
import src.sub
import src.user

import src.adminRoutes
import src.billRoutes
import src.get_otpRoutes
import src.loginRoutes
import src.miscRoutes
import src.registerRoutes
import src.subRoutes
