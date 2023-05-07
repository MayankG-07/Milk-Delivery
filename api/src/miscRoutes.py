from app import app
from db import connect, disconnect
from pydantic import BaseModel


class MilkOnlyNextDayParams(BaseModel):
    houseno: int


@app.put("/api/milk_only_next_day")
def milk_only_next_day(milkOnlyNextDayParams: MilkOnlyNextDayParams):
    connect()
    params_dict = milkOnlyNextDayParams.dict()
    houseno = params_dict["houseno"]

    from db import con, cursor

    cursor.execute(f"UPDATE users SET milk_next_day=1 WHERE houseno={houseno}")
    con.commit()

    cursor.execute(f"SELECT milk_next_day FROM users WHERE houseno={houseno}")
    result = cursor.fetchall()[0][0]

    if not result:
        disconnect()
        return {"error": "An error occurred"}
    disconnect()
    return {"success": "MILK_NEXT_DAY"}
