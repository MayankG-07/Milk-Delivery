from app import app
from house import House
from user import User
from db import connect, disconnect
from misc import dateFromString, dateTimeFromString
from fastapi import HTTPException, Depends
from sub import Subscription
from bill import Bill
from schemas import RegisterHouseParams, RegisterHouseResponseModel
from utils import get_current_user


# * inline with new schema
@app.post(
    "/house/register",
    summary="Register a new house",
    status_code=201,
    response_model=RegisterHouseResponseModel,
)
async def register_house(
    params: RegisterHouseParams, token_data=Depends(get_current_user)
):
    wing = params.wing
    houseno = params.houseno
    userid: int = token_data.get("userid")

    con = connect()

    house = House(wing=wing, houseno=houseno)
    await house.register(con=con)
    await house.sync_details(con=con)
    user = User(userid=userid)
    await user.sync_details(con=con)

    await house.add_member(user, con=con)
    await user.sync_details(con=con)
    await house.sync_details(con=con)

    details = {
        "houseid": house.houseid,
        "wing": house.wing,
        "houseno": house.houseno,
        "members": house.members,
    }
    disconnect(con)
    return details


# * inline with new schema
@app.put("/house/{houseid}/add-member", summary="Add member to house", status_code=201)
async def add_member(houseid: int, userid: int, token_data=Depends(get_current_user)):
    con = connect()
    user = User(userid=userid)
    await user.sync_details(con=con)

    house = House(houseid=houseid)
    await house.sync_details(con=con)

    await house.add_member(user, con=con)
    await user.sync_details(con=con)
    details = {
        "userid": user.userid,
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "imgUrl": user.imgUrl,
        "houseids": user.houseids,
        "verified": user.verified,
    }
    disconnect(con)
    return details


# * inline with new schema
@app.delete(
    "/house/{houseid}/delete-member",
    summary="Delete member from house",
    status_code=204,
)
async def delete_member(
    houseid: int, useridToRemove: int, token_data=Depends(get_current_user)
):
    con = connect()
    userid: int = token_data.get("userid")
    user = User(userid=useridToRemove)
    await user.sync_details(con=con)

    house = House(houseid=houseid)
    await house.sync_details(con=con)

    await house.delete_member(user, con=con)
    disconnect(con)


@app.get("/houses/paid-details", summary="View list of paid bills", status_code=200)
async def get_paid_details():
    con = connect()
    cursor = con.cursor()

    cursor.execute("SELECT * FROM bills WHERE paid=1")
    result = cursor.fetchall()
    details = [
        {
            "billid": row[0],
            "billGenTime": row[1],
            "billAmt": row[2],
            "paid": row[3],
            "subid": row[4],
            "houseid": row[5],
        }
        for row in result
    ]

    disconnect(con)
    return {"data": details}


# * inline with new schema
@app.get(
    "/houses/due-details",
    summary="View list of houses who have due bills",
    status_code=200,
)
async def get_due_details():
    con = connect()
    cursor = con.cursor()

    cursor.execute("SELECT * FROM bills WHERE paid=0")
    result = cursor.fetchall()
    details = [
        {
            "billid": row[0],
            "billGenTime": row[1],
            "billAmt": row[2],
            "paid": row[3],
            "subid": row[4],
            "houseid": row[5],
        }
        for row in result
    ]

    disconnect(con)
    return {"data": details}


# * inline with new schema
@app.get(
    "/house/{houseid}/due-details", summary="View due bills of a house", status_code=200
)
async def get_house_due_details(houseid: int):
    con = connect()
    cursor = con.cursor()

    cursor.execute(f"SELECT * FROM bills WHERE houseid={houseid} AND paid=0")
    result = cursor.fetchall()
    details = [
        {
            "billid": row[0],
            "billGenTime": row[1],
            "billAmt": row[2],
            "paid": row[3],
            "subid": row[4],
            "houseid": row[5],
        }
        for row in result
    ]

    disconnect(con)
    return {"data": details}


# * inline with new schema
@app.get(
    "/house/{houseid}/paid-details",
    summary="View paid bills of a house",
    status_code=200,
)
async def get_house_paid_details(houseid: int):
    con = connect()
    cursor = con.cursor()

    cursor.execute(f"SELECT * FROM bills WHERE houseid={houseid} AND paid=1")
    result = cursor.fetchall()
    details = [
        {
            "billid": row[0],
            "billGenTime": row[1],
            "billAmt": row[2],
            "paid": row[3],
            "subid": row[4],
            "houseid": row[5],
        }
        for row in result
    ]

    disconnect(con)
    return {"data": details}


# * inline with new schema
@app.get(
    "/house/{houseid}/subs-details",
    summary="View list of subscriptions of a house",
    status_code=200,
)
async def get_house_sub_details(houseid: int):
    con = connect()
    house = House(houseid)
    await house.sync_details(con=con)
    details = await house.subs_details(con=con)
    disconnect(con)
    return details


# * inline with new schema
@app.patch(
    "/house/{houseid}/sub/{subid}/not-delivered",
    summary="Update could not deliver to a house on a date",
    status_code=204,
)
async def not_delivered(houseid: int, subid: int, clientDate: str):
    con = connect()
    try:
        date = dateFromString(clientDate)
    except Exception as e:
        print(e)
        disconnect(con)
        raise HTTPException(status_code=400, detail="Invalid data")

    house = House(houseid=houseid)
    await house.sync_details(con=con)

    sub = Subscription(subid)
    await sub.sync_details(con=con)
    await sub.could_not_deliver(date, con=con)
    disconnect(con)


# * inline with new schema
@app.patch(
    "/house/{houseid}/sub/{subid}/delivered",
    summary="Update delivered to a house on a date",
    status_code=204,
)
async def delivered(houseid: int, subid: int, clientDate: str):
    con = connect()
    try:
        date = dateFromString(clientDate)
    except Exception as e:
        print(e)
        disconnect(con)
        raise HTTPException(status_code=400, detail="Invalid data")

    house = House(houseid=houseid)
    await house.sync_details(con=con)

    sub = Subscription(subid)
    await sub.sync_details(con=con)
    await sub.deliver(date, con=con)
    disconnect(con)


# * inline with new schema
@app.post(
    "/house/{houseid}/sub/{subid}/bill/generate",
    summary="Generate bill of a subscription",
    status_code=201,
)
async def generate_bill(
    houseid: int, subid: int, clientDateTime: str, token_data=Depends(get_current_user)
):
    con = connect()
    clientDateTime = dateTimeFromString(clientDateTime)
    userid = token_data.get("userid")
    house = House(houseid=houseid)
    await house.sync_details(con=con)
    sub = Subscription(subid=subid, house=house)
    await sub.sync_details(con=con)
    bill = Bill(billGenTime=clientDateTime, sub=sub, house=house)

    details = await bill.generate(con=con)
    disconnect(con)
    return details


# * inline with new schema
@app.put(
    "/house/{houseid}/sub/{subid}/bill/{billid}/pay",
    summary="Pay bill",
    status_code=204,
)
async def pay_bill(
    houseid: int, subid: int, billid: int, token_data=Depends(get_current_user)
):
    con = connect()
    userid: int = token_data.get("userid")
    house = House(houseid=houseid)
    await house.sync_details(con=con)
    sub = Subscription(subid=subid, house=house)
    await sub.sync_details(con=con)
    bill = Bill(billid=billid, sub=sub, house=house)
    await bill.sync_details(con=con)

    await bill.pay(con=con)
    disconnect(con)


# * inline with new schema
@app.get("/house/{houseid}/details", summary="View details of a house", status_code=200)
async def get_house_details(houseid: int):
    con = connect()
    house = House(houseid=houseid)
    await house.sync_details(con=con)
    details = {
        "houseid": house.houseid,
        "wing": house.wing,
        "houseno": house.houseno,
        "members": house.members,
    }
    disconnect(con)
    return details
