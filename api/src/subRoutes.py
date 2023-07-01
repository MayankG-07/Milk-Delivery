from app import app
from user import User
from sub import Subscription
from pydantic import BaseModel
from typing import Optional


class SubscribeParams(BaseModel):
    wing: str
    houseno: int
    sub_type: str
    milk_comp: str
    milk_type: str
    start_date: str
    auto_renew: bool
    omit: Optional[list[int]] = None


class NoMilkNextDayParams(BaseModel):
    wing: str
    houseno: int


class PauseSubParams(BaseModel):
    wing: str
    houseno: int
    pause_date: str
    resume_date: str


@app.post("/api/sub/new")
async def subscribe(subscribeParams: SubscribeParams):
    params_dict = subscribeParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]
    sub_type = params_dict["sub_type"]
    milk_comp = params_dict["milk_comp"]
    milk_type = params_dict["milk_type"]
    start_date = params_dict["start_date"]
    auto_renew = params_dict["auto_renew"]
    try:
        omit = params_dict["omit"]
    except:
        omit = None

    user = User(wing, houseno)
    sub = Subscription(user)
    if sub.doesExist():
        return {"error": "SUB_EXISTS"}

    message = sub.activate(sub_type, milk_comp, milk_type, start_date, auto_renew, omit)
    return message


@app.patch("/api/sub/no_milk_next_day")
async def no_milk_next_day(noMilkNextDayParams: NoMilkNextDayParams):
    params_dict = noMilkNextDayParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]

    user = User(wing, houseno)
    sub = Subscription(user)
    if not sub.doesExist():
        return {"error": "SUB_NOT_EXISTS"}

    message = sub.noMilkNextDay()
    return message


@app.patch("/api/sub/pause")
async def pause_sub(pauseSubParams: PauseSubParams):
    params_dict = pauseSubParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]
    pause_date = params_dict["pause_date"]
    resume_date = params_dict["resume_date"]

    user = User(wing, houseno)
    sub = Subscription(user)

    if not sub.doesExist():
        return {"error": "SUB_NOT_EXISTS"}

    message = sub.pause(pause_date, resume_date)
    return message
