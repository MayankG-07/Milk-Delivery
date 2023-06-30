from app import app
from delivery import Delivery
from pydantic import BaseModel
from user import User
from db import connect, disconnect


class CouldNotDeliverParams(BaseModel):
    wing: str
    houseno: int


class GetUserPaidDetailsParams(BaseModel):
    wing: str
    houseno: int


class GetUserDueDetailsParams(BaseModel):
    wing: str
    houseno: int


class GetUserLatestSubDetailsParams(BaseModel):
    wing: str
    houseno: int


class QueryParams(BaseModel):
    query: str


@app.get("/admin/get_next_day_delivery_details")
def get_next_day_delivery_details():
    delivery = Delivery()
    message = delivery.get_next_day_details()
    return message


@app.patch("/admin/could_not_deliver")
def could_not_deliver(couldNotDeliverParams: CouldNotDeliverParams):
    params_dict = couldNotDeliverParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]

    delivery = Delivery()
    user = User(wing, houseno)
    message = delivery.could_not_deliver(user)
    return message


@app.get("/admin/get_paid_details")
def get_paid_details():
    connect()
    from db import con

    cursor = con.cursor()

    cursor.execute("SELECT wing, houseno, bill_due, bills_paid FROM users")
    result = cursor.fetchall()

    details = [
        {"wing": wing, "houseno": houseno, "last_paid": eval(bills_paid)[-1]}
        for wing, houseno, bill_due, bills_paid in result
        if not bill_due
    ]
    disconnect()
    return {"success": "GET_PAID_DETS_SUCCESS", "data": details}


@app.get("/admin/get_due_details")
def get_due_details():
    connect()
    from db import con

    cursor = con.cursor()

    cursor.execute("SELECT wing, houseno, bill_due, bill_amt FROM users")
    result = cursor.fetchall()

    details = [
        {"wing": wing, "houseno": houseno, "bill_due": bill_due, "bill_amt": bill_amt}
        for wing, houseno, bill_due, bill_amt in result
        if bill_due
    ]
    disconnect()
    return {"success": "GET_DUE_DETS_SUCCESS", "data": details}


@app.put("/admin/get_paid_details/user")
def get_user_paid_details(getUserPaidDetailsParams: GetUserPaidDetailsParams):
    connect()
    params_dict = getUserPaidDetailsParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]

    from db import con

    cursor = con.cursor()

    cursor.execute(f"SELECT bills_paid FROM {wing}{houseno}")

    try:
        result = eval(cursor.fetchall()[0][0])
        # print(result)

        details = [
            {"due_date": row[0], "bill_amt": row[1], "paid_date": row[2]}
            for row in result
        ]
    except:
        disconnect()
        return {"success": "GET_USER_PAID_DETS_SUCCESS", "data": []}
    disconnect()
    return {"success": "GET_USER_PAID_DETS_SUCCESS", "data": details}


@app.put("/admin/get_due_details/user")
def get_user_due_details(getUserDueDetailsParams: GetUserDueDetailsParams):
    connect()
    params_dict = getUserDueDetailsParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]
    from db import con

    cursor = con.cursor()

    cursor.execute(f"SELECT bills_due FROM {wing}{houseno}")

    result = cursor.fetchall()

    if not result[0]:
        disconnect()
        return {"error": "NO_BILL_DUE"}

    try:
        details = [
            {"due_date": eval(row[0]), "bill_amt": eval(row)[1]} for row in result
        ]
    except:
        disconnect()
        return {"success": "GET_USER_DUE_DETS_SUCCESS", "data": details}
    disconnect()
    return {"success": "GET_USER_DUE_DETS_SUCCESS", "data": details}


@app.put("/admin/get_user_sub_details")
def get_user_sub_details(getUserLatestSubDetailsParams: GetUserLatestSubDetailsParams):
    connect()
    params_dict = getUserLatestSubDetailsParams.dict()
    houseno = params_dict["houseno"]
    from db import con

    cursor = con.cursor()

    cursor.execute(
        f"SELECT subid, milkid, sub_start, omit_days, auto_renew FROM users WHERE houseno={houseno}"
    )

    result = cursor.fetchall()[0]

    if result[0] is None:
        disconnect()
        return {"success": "GET_USER_SUB_DETS_SUCCESS", "data": []}

    details = {
        "subid": result[0],
        "milkid": result[1],
        "sub_start": result[2],
        "omit_days": eval(result[3]),
        "auto_renew": result[4],
    }

    disconnect()
    return {"success": "GET_USER_SUB_DETS_SUCCESS", "data": details}


@app.put("/admin/query")
def query(queryParams: QueryParams):
    connect()
    params_dict = queryParams.dict()
    query = params_dict["query"]
    from db import con

    cursor = con.cursor()

    try:
        cursor.execute(query)
        result = [list(row) for row in cursor.fetchall()]
    except Exception as e:
        print(e)
        disconnect()
        return {"error": "QUERY_ERROR", "message": e}

    disconnect()
    return {"success": "QUERY_SUCCESS", "data": result}
