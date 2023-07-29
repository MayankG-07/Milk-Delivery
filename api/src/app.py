from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:3000"]


def create_app() -> FastAPI:
    app = FastAPI(title="Milk Delivery")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


app = create_app()


@app.get("/")
async def root() -> dict:
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
