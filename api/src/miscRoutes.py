from app import app
from db import connect, disconnect
from fastapi import HTTPException
from misc import dateFromInt, dateFromString
from datetime import timedelta


# * in line with new schema
@app.get(
    "/misc/tomorrow-delivery",
    summary="View list of houses to deliver to tomorrow",
    status_code=200,
)
async def get_next_day_delivery_details(clientDate: str):
    con = connect()
    cursor = con.cursor()

    clientNextDate = dateFromString(clientDate) + timedelta(days=1)
    nextDay = clientNextDate.weekday()

    cursor.execute(f"SELECT * FROM subs WHERE active=1")
    result = cursor.fetchall()
    details = [
        {
            "subid": row[0],
            "milkids": eval(row[1]),
            "sub_start": row[2],
            "days": eval(row[3]),
            "sub_end": row[4],
            "pause_date": row[5],
            "resume_date": row[6],
            "delivered": [dateFromInt(date) for date in eval(row[7])]
            if row[7] is not None
            else [],
            "not_delivered": [dateFromInt(date) for date in eval(row[8])]
            if row[8] is not None
            else [],
            "active": bool(row[9]),
            "houseid": row[10],
        }
        for row in result
    ]

    final_details = [
        {"houseid": item["houseid"], "milkids": item["milkids"]}
        for item in details
        if (nextDay in item["days"])
        and (
            not (
                (clientNextDate > item["pause_date"])
                and (clientNextDate < item["resume_date"])
            )
            if ((item["pause_date"] is not None) and (item["resume_date"] is not None))
            else True
        )
    ]

    disconnect(con)
    return final_details


# * inline with new schema
@app.put("/misc/sql-query", summary="Perform SQL query on database", status_code=200)
async def query(query: str):
    con = connect()
    cursor = con.cursor()

    try:
        cursor.execute(query)
        result = [list(row) for row in cursor.fetchall()]
    except Exception as e:
        disconnect()
        raise HTTPException(
            status_code=400, detail={"message": "Invalid query", "error": str(e)}
        )

    disconnect(con)
    return {"data": result}
