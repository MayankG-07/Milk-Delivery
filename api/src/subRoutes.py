from app import app
from sub import Subscription
from house import House
from misc import dateFromString
from schemas import NewSubParams, PauseSubParams
from fastapi import Depends
from utils import get_current_user


# * inline with new schema
@app.post("/sub/new", summary="Create new subscription", status_code=201)
async def subscribe(params: NewSubParams, token_data=Depends(get_current_user)):
    userid = token_data.get("userid")
    houseid = params.houseid
    milkids = params.milkids
    sub_start = dateFromString(params.sub_start)
    sub_end = dateFromString(params.sub_end)
    days = params.days

    house = House(houseid=houseid)
    await house.sync_details()
    sub = Subscription(
        house=house, milkids=milkids, sub_start=sub_start, sub_end=sub_end, days=days
    )

    details = await sub.activate()
    return details


# * inline with new schema
@app.put("/sub/{subid}/pause", summary="Pause subscription", status_code=200)
async def pause_sub(
    subid: int, params: PauseSubParams, token_data=Depends(get_current_user)
):
    userid = token_data.get("userid")
    pause_date = dateFromString(params.pause_date)
    resume_date = dateFromString(params.resume_date)

    sub = Subscription(subid=subid)
    await sub.sync_details()

    details = await sub.pause(pause_date, resume_date)
    return details
