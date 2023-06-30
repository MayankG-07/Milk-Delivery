from user import User
from db import connect, disconnect
from sub import Subscription
from datetime import datetime


class Delivery:
    def __init__(self):
        pass

    def get_next_day_details(self):
        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute("SELECT wing, houseno FROM users WHERE milk_next_day=1")
        result = cursor.fetchall()
        users = [{"wing": user[0], "houseno": user[1]} for user in result]
        disconnect()
        return {"success": "GET_DELIVERY_DETS_SUCCESS", "data": users}

    def deliver_today(self, user: User):
        sub = Subscription(user)
        message = sub.deliver_milk_today()

        return message

    def could_not_deliver(self, user: User):
        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute(
            f"SELECT could_not_deliver FROM users WHERE houseno={user.houseno}"
        )

        result = cursor.fetchall()[0][0]

        try:
            could_not_deliver = eval(result)
        except:
            could_not_deliver = []

        today = str(datetime.now().date())
        toady = int(today[:4] + today[5:7] + today[8:])
        could_not_deliver.append(toady)

        cursor.execute(
            f"UPDATE users SET could_not_deliver='{could_not_deliver}' WHERE houseno={user.houseno}"
        )

        cursor.execute(f"SELECT sub_start FROM users WHERE houseno={user.houseno}")
        start_date = cursor.fetchall()[0][0]

        cursor.execute(
            f"SELECT could_not_deliver FROM {user.wing}{user.houseno} WHERE sub_start='{start_date}'"
        )

        try:
            could_not_deliver = eval(cursor.fetchall()[0][0]).append(today)
        except:
            could_not_deliver = [today]

        cursor.execute(
            f"UPDATE {user.wing}{user.houseno} SET could_not_deliver='{could_not_deliver}' WHERE sub_start='{start_date}'"
        )

        con.commit()
        disconnect()
        return {"success": "MILK_NOT_DELIVER_SUCCESS"}
